function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values) {
  if (values.length <= 1) return 0;
  const average = mean(values);
  return Math.sqrt(
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
      values.length
  );
}

function percentile(values, quantile) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = clamp01(quantile) * (sorted.length - 1);
  const left = Math.floor(position);
  const right = Math.min(sorted.length - 1, left + 1);
  const mix = position - left;
  return sorted[left] * (1 - mix) + sorted[right] * mix;
}

const ROLE_NAMES = ["bass", "drums", "other", "voice"];

export function inspectVisualizerFrames({
  data,
  frameCount,
  barCount,
  roles
}) {
  if (!(data instanceof Uint8Array)) {
    throw new TypeError("Visualizer diagnostics require Uint8Array data.");
  }
  if (!Number.isInteger(frameCount) || frameCount <= 0) {
    throw new RangeError("frameCount must be a positive integer.");
  }
  if (!Number.isInteger(barCount) || barCount <= 0) {
    throw new RangeError("barCount must be a positive integer.");
  }
  if (data.length !== frameCount * barCount) {
    throw new RangeError(
      `Visualizer data length ${data.length} does not match ${frameCount}x${barCount}.`
    );
  }
  if (!Array.isArray(roles) || roles.length !== barCount) {
    throw new RangeError("roles must contain one role per bar.");
  }

  const normalized = Array.from(data, (value) => value / 255);
  const spatialSpreads = [];
  const roleContrasts = [];
  const frameMeans = [];
  const roleActivityTotals = Object.fromEntries(
    ROLE_NAMES.map((role) => [role, { sum: 0, count: 0 }])
  );

  for (let frame = 0; frame < frameCount; frame += 1) {
    const offset = frame * barCount;
    const values = normalized.slice(offset, offset + barCount);
    frameMeans.push(mean(values));
    spatialSpreads.push(standardDeviation(values));

    const roleMeans = ROLE_NAMES.map((role) => {
      const roleValues = values.filter((_, index) => roles[index] === role);
      return mean(roleValues);
    });
    roleContrasts.push(standardDeviation(roleMeans));
  }

  const commonMotionRatios = [];
  const transitionActivities = [];

  for (let frame = 1; frame < frameCount; frame += 1) {
    const previousOffset = (frame - 1) * barCount;
    const offset = frame * barCount;
    const deltas = Array.from({ length: barCount }, (_, index) =>
      normalized[offset + index] - normalized[previousOffset + index]
    );
    const absoluteActivity = mean(deltas.map(Math.abs));
    transitionActivities.push(absoluteActivity);

    if (absoluteActivity >= 0.002) {
      commonMotionRatios.push(
        Math.min(1, Math.abs(mean(deltas)) / absoluteActivity)
      );
    }

    for (let index = 0; index < barCount; index += 1) {
      const role = roles[index];
      const bucket = roleActivityTotals[role];
      if (!bucket) continue;
      bucket.sum += Math.abs(deltas[index]);
      bucket.count += 1;
    }
  }

  const roleActivity = Object.fromEntries(
    ROLE_NAMES.map((role) => {
      const bucket = roleActivityTotals[role];
      return [role, bucket.count ? bucket.sum / bucket.count : 0];
    })
  );

  return {
    frameCount,
    barCount,
    dynamicRange: percentile(normalized, 0.95) - percentile(normalized, 0.05),
    spatialSpread: mean(spatialSpreads),
    roleContrast: mean(roleContrasts),
    commonMotionRatio: commonMotionRatios.length
      ? mean(commonMotionRatios)
      : 0,
    activeTransitionRatio:
      transitionActivities.length
        ? transitionActivities.filter((value) => value >= 0.002).length /
          transitionActivities.length
        : 0,
    quietFrameRatio:
      frameMeans.filter((value) => value < 0.08).length / frameMeans.length,
    roleActivity
  };
}
