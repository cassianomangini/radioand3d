function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeWord(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("und")
    .replace(/[’']/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function tokenSimilarity(left, right) {
  if (!left || !right) return 0;
  if (left === right) return 1;

  const rows = Array.from({ length: left.length + 1 }, (_, index) => index);
  for (let column = 1; column <= right.length; column += 1) {
    let previous = rows[0];
    rows[0] = column;
    for (let row = 1; row <= left.length; row += 1) {
      const current = rows[row];
      rows[row] = Math.min(
        rows[row] + 1,
        rows[row - 1] + 1,
        previous + (left[row - 1] === right[column - 1] ? 0 : 1)
      );
      previous = current;
    }
  }

  return 1 - rows[left.length] / Math.max(left.length, right.length);
}

function matchScore(left, right) {
  const similarity = tokenSimilarity(left, right);
  if (similarity === 1) return 5;
  if (similarity >= 0.86) return 3;
  if (similarity >= 0.72) return 1;
  return -3;
}

export function splitCanonicalLyrics(lyrics) {
  const lines = lyrics.replace(/\r\n?/g, "\n").split("\n");
  const structured = [];
  let breakBefore = false;

  for (const rawLine of lines) {
    const text = rawLine.trim();
    if (!text) {
      breakBefore = structured.length > 0;
      continue;
    }

    if (/^\[[^\]]+\]$/.test(text)) {
      structured.push({ kind: "section", text, breakBefore });
      breakBefore = false;
      continue;
    }

    const words = text
      .split(/\s+/)
      .map((token) => ({ text: token, normalized: normalizeWord(token) }))
      .filter((word) => word.normalized);

    if (!words.length) continue;
    structured.push({ kind: "line", text, words, breakBefore });
    breakBefore = false;
  }

  return structured;
}

export function extractWhisperWords(result) {
  const source = Array.isArray(result?.word_segments)
    ? result.word_segments
    : Array.isArray(result?.segments)
      ? result.segments.flatMap((segment) => Array.isArray(segment?.words) ? segment.words : [])
      : [];

  return source.flatMap((word) => {
    const text = typeof word?.word === "string" ? word.word.trim() : "";
    const normalized = normalizeWord(text);
    const start = Number(word?.start);
    const end = Number(word?.end);
    if (!normalized || !Number.isFinite(start) || !Number.isFinite(end) || end < start) return [];
    return [{
      text,
      normalized,
      start,
      end,
      score: Number.isFinite(Number(word?.score)) ? Number(word.score) : null
    }];
  });
}

function alignWords(canonical, recognized) {
  const rows = canonical.length + 1;
  const columns = recognized.length + 1;
  const gap = -1.5;
  const score = Array.from({ length: rows }, () => new Float64Array(columns));
  const trace = Array.from({ length: rows }, () => new Uint8Array(columns));

  for (let row = 1; row < rows; row += 1) {
    score[row][0] = score[row - 1][0] + gap;
    trace[row][0] = 1;
  }
  for (let column = 1; column < columns; column += 1) {
    score[0][column] = score[0][column - 1] + gap;
    trace[0][column] = 2;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const diagonal = score[row - 1][column - 1] + matchScore(canonical[row - 1].normalized, recognized[column - 1].normalized);
      const up = score[row - 1][column] + gap;
      const left = score[row][column - 1] + gap;
      if (diagonal >= up && diagonal >= left) {
        score[row][column] = diagonal;
        trace[row][column] = 0;
      } else if (up >= left) {
        score[row][column] = up;
        trace[row][column] = 1;
      } else {
        score[row][column] = left;
        trace[row][column] = 2;
      }
    }
  }

  const matches = new Map();
  let row = canonical.length;
  let column = recognized.length;
  while (row > 0 || column > 0) {
    const direction = trace[row][column];
    if (row > 0 && column > 0 && direction === 0) {
      const similarity = tokenSimilarity(canonical[row - 1].normalized, recognized[column - 1].normalized);
      if (similarity >= 0.72) matches.set(row - 1, recognized[column - 1]);
      row -= 1;
      column -= 1;
    } else if (row > 0 && (column === 0 || direction === 1)) {
      row -= 1;
    } else {
      column -= 1;
    }
  }

  return matches;
}

function fillMissingTimings(words) {
  const result = words.map((word) => ({ ...word }));
  let cursor = 0;

  while (cursor < result.length) {
    if (Number.isFinite(result[cursor].start)) {
      cursor += 1;
      continue;
    }

    const firstMissing = cursor;
    while (cursor < result.length && !Number.isFinite(result[cursor].start)) cursor += 1;
    const lastMissing = cursor - 1;
    const previous = firstMissing > 0 ? result[firstMissing - 1] : null;
    const next = cursor < result.length ? result[cursor] : null;
    const count = lastMissing - firstMissing + 1;

    if (previous && next) {
      const available = Math.max(0.04 * count, next.start - previous.end);
      const step = available / (count + 1);
      for (let index = 0; index < count; index += 1) {
        const center = previous.end + step * (index + 1);
        const half = clamp(step * 0.36, 0.025, 0.18);
        result[firstMissing + index].start = Math.max(previous.end, center - half);
        result[firstMissing + index].end = Math.min(next.start, center + half);
      }
    } else if (previous) {
      for (let index = 0; index < count; index += 1) {
        const start = previous.end + index * 0.32;
        result[firstMissing + index].start = start;
        result[firstMissing + index].end = start + 0.26;
      }
    } else if (next) {
      const blockStart = Math.max(0, next.start - count * 0.32);
      for (let index = 0; index < count; index += 1) {
        const start = blockStart + index * 0.32;
        result[firstMissing + index].start = start;
        result[firstMissing + index].end = Math.min(next.start, start + 0.26);
      }
    } else {
      throw new Error("Cannot interpolate lyrics without at least one timed word.");
    }
  }

  let lastEnd = 0;
  for (const word of result) {
    word.start = Math.max(lastEnd, word.start);
    word.end = Math.max(word.start + 0.02, word.end);
    lastEnd = word.end;
  }
  return result;
}

export function buildSyncedLyrics(lyrics, whisperResult, { minCoverage = 0.45 } = {}) {
  const structured = splitCanonicalLyrics(lyrics);
  const canonical = [];

  structured.forEach((line, lineIndex) => {
    if (line.kind !== "line") return;
    line.words.forEach((word, wordIndex) => canonical.push({ ...word, lineIndex, wordIndex }));
  });

  const recognized = extractWhisperWords(whisperResult);
  if (!canonical.length) throw new Error("Canonical lyrics contain no alignable words.");
  if (!recognized.length) throw new Error("WhisperX returned no word timestamps.");

  const matches = alignWords(canonical, recognized);
  const coverage = matches.size / canonical.length;
  if (coverage < minCoverage) {
    throw new Error(`Alignment coverage ${(coverage * 100).toFixed(1)}% is below the ${(minCoverage * 100).toFixed(0)}% minimum.`);
  }

  const timedWords = fillMissingTimings(canonical.map((word, index) => {
    const recognizedWord = matches.get(index);
    return {
      text: word.text,
      lineIndex: word.lineIndex,
      wordIndex: word.wordIndex,
      start: recognizedWord?.start ?? Number.NaN,
      end: recognizedWord?.end ?? Number.NaN,
      matched: Boolean(recognizedWord)
    };
  }));

  const byLine = new Map();
  for (const word of timedWords) {
    const list = byLine.get(word.lineIndex) ?? [];
    list.push(word);
    byLine.set(word.lineIndex, list);
  }

  const lines = structured.map((line, lineIndex) => {
    if (line.kind === "section") return line;
    const words = byLine.get(lineIndex) ?? [];
    const matchedCount = words.filter((word) => word.matched).length;
    return {
      kind: "line",
      text: line.text,
      breakBefore: line.breakBefore,
      start: words[0]?.start ?? 0,
      end: words.at(-1)?.end ?? 0,
      confidence: words.length ? matchedCount / words.length : 0,
      words: words.map(({ text, start, end, matched }) => ({ text, start, end, matched }))
    };
  });

  return {
    version: 1,
    source: "whisperx",
    language: typeof whisperResult?.language === "string" ? whisperResult.language : null,
    coverage,
    lines
  };
}
