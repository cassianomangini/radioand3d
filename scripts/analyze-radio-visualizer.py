#!/usr/bin/env python3
"""Build and upload synchronized musical visualizer sidecars for CM Radio.

The expensive source separation happens offline. The browser only reads compact,
quantized bar frames synchronized to the existing audio element currentTime.
The batch reads the reconciled local audio files, uploads each completed sidecar
immediately, and can safely resume after interruption.
"""

from __future__ import annotations

import argparse
import base64
import gc
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate CM Radio musical visualizer analysis.")
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--model", default="htdemucs")
    parser.add_argument("--device", choices=("auto", "cpu", "cuda"), default="auto")
    parser.add_argument("--shifts", type=int, default=1)
    return parser.parse_args()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def mono_numpy(tensor: Any) -> Any:
    array = tensor.detach().cpu().numpy()
    if array.ndim == 1:
        return array.astype("float32", copy=False)
    return array.mean(axis=0).astype("float32", copy=False)


def stereo_numpy(tensor: Any, np: Any) -> Any:
    array = tensor.detach().cpu().numpy().astype("float32", copy=False)
    if array.ndim == 1:
        return np.stack([array, array], axis=0)
    if array.shape[0] == 1:
        return np.repeat(array, 2, axis=0)
    return array[:2]


def relative_db(power: Any, np: Any) -> Any:
    safe = np.maximum(power, 1e-12)
    db = 10.0 * np.log10(safe)
    peak = float(np.max(db)) if db.size else 0.0
    return db - peak


def robust_band_normalize(
    power: Any,
    np: Any,
    floor_db: float = -66.0,
    strong_db: float = -34.0,
) -> Any:
    db = relative_db(power, np)
    low = np.percentile(db, 10, axis=1, keepdims=True)
    high = np.percentile(db, 95, axis=1, keepdims=True)
    dynamic = np.clip((db - low) / np.maximum(high - low, 3.0), 0.0, 1.0)
    audible = np.clip((db - floor_db) / (strong_db - floor_db), 0.0, 1.0)
    return dynamic * audible


def robust_event_normalize(events: Any, np: Any) -> Any:
    scale = np.percentile(events, 95, axis=1, keepdims=True)
    return np.clip(events / np.maximum(scale, 1e-6), 0.0, 1.0)


def rms_frames(signal: Any, librosa: Any, frame_length: int, hop_length: int) -> Any:
    return librosa.feature.rms(
        y=signal,
        frame_length=frame_length,
        hop_length=hop_length,
        center=True,
    )[0]


def fit_frames(values: Any, frame_count: int, np: Any) -> Any:
    if values.shape[-1] == frame_count:
        return values
    if values.shape[-1] > frame_count:
        return values[..., :frame_count]
    padding = frame_count - values.shape[-1]
    edge = (
        values[..., -1:]
        if values.shape[-1]
        else np.zeros((*values.shape[:-1], 1), dtype=np.float32)
    )
    return np.concatenate([values, np.repeat(edge, padding, axis=-1)], axis=-1)


def smooth_release(values: Any, fps: float, release_seconds: float, np: Any) -> Any:
    smoothed = np.array(values, dtype=np.float32, copy=True)
    if smoothed.shape[-1] <= 1:
        return smoothed
    decay = float(np.exp(-1.0 / max(fps * release_seconds, 1.0)))
    for frame in range(1, smoothed.shape[-1]):
        smoothed[..., frame] = np.maximum(
            smoothed[..., frame],
            smoothed[..., frame - 1] * decay,
        )
    return smoothed


def moving_average(values: Any, width: int, np: Any) -> Any:
    if width <= 1 or values.shape[-1] <= 1:
        return values
    kernel = np.ones(width, dtype=np.float32) / float(width)
    return np.stack(
        [
            np.convolve(row, kernel, mode="same")
            for row in values
        ],
        axis=0,
    )


def spectral_levels(
    signal: Any,
    sample_rate: int,
    hop_length: int,
    n_fft: int,
    band_count: int,
    fmin: float,
    fmax: float,
    np: Any,
    librosa: Any,
    *,
    release_seconds: float,
    average_width: int = 1,
) -> Any:
    if band_count <= 0:
        return np.zeros((0, 1), dtype=np.float32)

    power = librosa.feature.melspectrogram(
        y=signal,
        sr=sample_rate,
        n_fft=n_fft,
        hop_length=hop_length,
        n_mels=band_count,
        fmin=fmin,
        fmax=fmax,
        power=2.0,
        center=True,
    )
    levels = robust_band_normalize(power, np)
    if average_width > 1:
        levels = moving_average(levels, average_width, np)
    return smooth_release(levels, sample_rate / hop_length, release_seconds, np)


def onset_pulse(
    signal: Any,
    sample_rate: int,
    hop_length: int,
    frame_count: int,
    np: Any,
    librosa: Any,
) -> Any:
    onset = librosa.onset.onset_strength(
        y=signal,
        sr=sample_rate,
        hop_length=hop_length,
        aggregate=np.median,
    )
    onset = fit_frames(onset, frame_count, np)
    if not onset.size or float(np.max(onset)) <= 1e-8:
        return np.zeros(frame_count, dtype=np.float32)

    scale = max(float(np.percentile(onset, 95)), 1e-6)
    normalized = np.clip(onset / scale, 0.0, 1.0)
    peaks = librosa.util.peak_pick(
        normalized,
        pre_max=1,
        post_max=1,
        pre_avg=2,
        post_avg=3,
        delta=0.08,
        wait=2,
    )
    impulses = np.zeros(frame_count, dtype=np.float32)
    impulses[peaks] = normalized[peaks]
    return smooth_release(
        impulses[None, :],
        sample_rate / hop_length,
        0.16,
        np,
    )[0]


def build_instrument_side(
    instrument_stems: dict[str, Any],
    channel: int,
    sample_rate: int,
    hop_length: int,
    n_fft: int,
    side_count: int,
    fmax: float,
    np: Any,
    librosa: Any,
) -> Any:
    frame_count = 1
    for stem in instrument_stems.values():
        if stem.shape[-1]:
            frame_count = max(
                frame_count,
                1 + int(np.ceil(stem.shape[-1] / hop_length)),
            )

    bass_count = max(2, int(round(side_count * 0.21)))
    drum_count = max(3, int(round(side_count * 0.29)))
    if bass_count + drum_count >= side_count:
        drum_count = max(2, side_count - bass_count - 1)
    other_count = side_count - bass_count - drum_count

    reference = next(iter(instrument_stems.values()))
    zero = np.zeros(reference.shape[-1], dtype=np.float32)
    bass = instrument_stems.get("bass")
    drums = instrument_stems.get("drums")
    bass_signal = bass[channel] if bass is not None else zero
    drum_signal = drums[channel] if drums is not None else zero

    other_signals = [
        stem[channel]
        for name, stem in instrument_stems.items()
        if name not in {"bass", "drums"}
    ]
    if other_signals:
        other_signal = np.sum(np.stack(other_signals, axis=0), axis=0)
    else:
        other_signal = zero

    bass_levels = spectral_levels(
        bass_signal,
        sample_rate,
        hop_length,
        n_fft,
        bass_count,
        35.0,
        min(650.0, fmax),
        np,
        librosa,
        release_seconds=0.24,
        average_width=3,
    )
    drum_levels = spectral_levels(
        drum_signal,
        sample_rate,
        hop_length,
        n_fft,
        drum_count,
        45.0,
        min(14_000.0, fmax),
        np,
        librosa,
        release_seconds=0.13,
        average_width=2,
    )
    other_levels = spectral_levels(
        other_signal,
        sample_rate,
        hop_length,
        n_fft,
        other_count,
        90.0,
        fmax,
        np,
        librosa,
        release_seconds=0.22,
        average_width=3,
    )

    frame_count = min(
        bass_levels.shape[1],
        drum_levels.shape[1],
        other_levels.shape[1],
    )
    bass_levels = fit_frames(bass_levels, frame_count, np)
    drum_levels = fit_frames(drum_levels, frame_count, np)
    other_levels = fit_frames(other_levels, frame_count, np)

    pulse = onset_pulse(
        drum_signal,
        sample_rate,
        hop_length,
        frame_count,
        np,
        librosa,
    )
    drum_levels = np.clip(
        drum_levels * (0.82 + pulse[None, :] * 0.18),
        0.0,
        1.0,
    )

    # Outer -> inner: bass body, drum transients, harmonic/melodic accompaniment.
    return np.concatenate(
        [bass_levels, drum_levels, other_levels],
        axis=0,
    )


def build_bar_matrix(
    mix: Any,
    vocals: Any,
    instrument_stems: dict[str, Any],
    sample_rate: int,
    fps: float,
    bar_count: int,
    voice_count: int,
    np: Any,
    librosa: Any,
) -> tuple[Any, float, int, int, float]:
    if bar_count < 12:
        raise ValueError("barCount must be at least 12.")
    if voice_count < 4 or voice_count >= bar_count:
        raise ValueError("voiceBars must be at least 4 and smaller than barCount.")
    if (bar_count - voice_count) % 2:
        raise ValueError("barCount - voiceBars must be even so instruments can surround the center.")
    if not instrument_stems:
        raise ValueError("At least one non-vocal Demucs stem is required.")

    hop_length = max(256, int(round(sample_rate / fps)))
    actual_fps = sample_rate / hop_length
    n_fft = 2048 if sample_rate >= 24_000 else 1024
    fmax = min(18_000.0, sample_rate * 0.48)
    outer_count = bar_count - voice_count
    side_count = outer_count // 2

    left_levels = build_instrument_side(
        instrument_stems,
        0,
        sample_rate,
        hop_length,
        n_fft,
        side_count,
        fmax,
        np,
        librosa,
    )
    right_levels = build_instrument_side(
        instrument_stems,
        1,
        sample_rate,
        hop_length,
        n_fft,
        side_count,
        fmax,
        np,
        librosa,
    )

    voice_power = librosa.feature.melspectrogram(
        y=vocals,
        sr=sample_rate,
        n_fft=n_fft,
        hop_length=hop_length,
        n_mels=voice_count,
        fmin=90.0,
        fmax=min(8_000.0, fmax),
        power=2.0,
        center=True,
    )
    voice_norm = robust_band_normalize(
        voice_power,
        np,
        floor_db=-62.0,
        strong_db=-30.0,
    )

    frame_count = min(
        left_levels.shape[1],
        right_levels.shape[1],
        voice_norm.shape[1],
    )
    left_levels = fit_frames(left_levels, frame_count, np)
    right_levels = fit_frames(right_levels, frame_count, np)
    voice_norm = fit_frames(voice_norm, frame_count, np)

    mix_rms = fit_frames(
        rms_frames(mix, librosa, n_fft, hop_length),
        frame_count,
        np,
    )
    voice_rms = fit_frames(
        rms_frames(vocals, librosa, n_fft, hop_length),
        frame_count,
        np,
    )
    mix_peak = max(float(np.max(mix_rms)), 1e-6)
    absolute_voice = np.clip(
        (20.0 * np.log10(np.maximum(voice_rms / mix_peak, 1e-6)) + 58.0) / 28.0,
        0.0,
        1.0,
    )
    voice_ratio = voice_rms / np.maximum(mix_rms, 1e-6)
    voice_presence = (
        np.clip((voice_ratio - 0.06) / 0.30, 0.0, 1.0)
        * absolute_voice
    )
    voice_levels = np.clip(
        np.maximum(
            voice_norm * voice_presence[None, :],
            voice_presence[None, :] * 0.22,
        ),
        0.0,
        1.0,
    )

    bars = np.zeros((bar_count, frame_count), dtype=np.float32)
    bars[:side_count, :] = left_levels
    bars[bar_count - side_count:, :] = right_levels[::-1, :]

    center_start = side_count
    bars[center_start:center_start + voice_count, :] = voice_levels

    bars = np.power(np.clip(bars, 0.0, 1.0), 0.88)
    duration = len(mix) / sample_rate
    return bars, actual_fps, center_start, voice_count, duration


def encode_payload(
    bars: Any,
    fps: float,
    center_start: int,
    voice_count: int,
    duration: float,
    model: str,
    np: Any,
) -> dict[str, Any]:
    quantized = np.rint(
        np.clip(bars.T, 0.0, 1.0) * 255.0
    ).astype(np.uint8)
    packed = base64.b64encode(
        quantized.tobytes(order="C")
    ).decode("ascii")
    return {
        "version": 2,
        "source": "demucs+librosa",
        "model": model,
        "fps": round(float(fps), 6),
        "barCount": int(bars.shape[0]),
        "frameCount": int(bars.shape[1]),
        "duration": round(float(duration), 6),
        "encoding": "base64-u8",
        "layout": {
            "kind": "voice-center-instruments-around",
            "voiceStart": int(center_start),
            "voiceCount": int(voice_count),
        },
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "data": packed,
    }


def release_cuda(torch_module: Any) -> None:
    gc.collect()
    if torch_module.cuda.is_available():
        torch_module.cuda.empty_cache()


def require_environment(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def transcode_for_demucs(
    source: Path,
    destination: Path,
    ffmpeg_executable: str,
    samplerate: int,
) -> None:
    result = subprocess.run(
        [
            ffmpeg_executable,
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(source),
            "-vn",
            "-ac",
            "2",
            "-ar",
            str(samplerate),
            "-c:a",
            "pcm_s16le",
            str(destination),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(
            "ffmpeg could not decode the track: "
            + (result.stderr.strip() or "unknown decoding error")
        )


def checkpoint_report(
    report_path: Path,
    *,
    model: str,
    device: str,
    processed: list[str],
    failures: list[dict[str, str]],
    total: int,
) -> None:
    write_json(
        report_path,
        {
            "model": model,
            "device": device,
            "total": total,
            "processed": processed,
            "failed": failures,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        },
    )


def main() -> int:
    args = parse_args()

    try:
        import boto3
        import imageio_ffmpeg
        import librosa
        import numpy as np
        import soundfile as sf
        import torch
        from demucs import pretrained
        from demucs.apply import apply_model
    except ImportError as error:
        missing_name = getattr(error, "name", None)
        if missing_name in {
            "difflib",
            "json",
            "pathlib",
            "subprocess",
            "venv",
        }:
            print(
                "Python standard library is incomplete or its environment is corrupted. "
                f"Missing module: {missing_name}.",
                file=sys.stderr,
            )
        else:
            print(
                "Visualizer dependencies are missing or failed to import. "
                "Run pnpm visualizer:sync again so the project can prepare them.",
                file=sys.stderr,
            )
        print(
            f"Python: {sys.executable} ({sys.version.split()[0]})",
            file=sys.stderr,
        )
        print(str(error), file=sys.stderr)
        return 2

    ffmpeg_executable = imageio_ffmpeg.get_ffmpeg_exe()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    jobs = manifest.get("jobs", [])
    report_path = Path(manifest["reportPath"])
    if not jobs:
        write_json(report_path, {"processed": [], "failed": []})
        return 0

    device = (
        "cuda"
        if args.device == "auto" and torch.cuda.is_available()
        else args.device
    )
    if device == "auto":
        device = "cpu"
    if device == "cuda" and not torch.cuda.is_available():
        print(
            "CUDA was requested but torch.cuda.is_available() is false.",
            file=sys.stderr,
        )
        return 2

    endpoint = require_environment("CM_VISUALIZER_R2_ENDPOINT")
    bucket = require_environment("CM_VISUALIZER_R2_BUCKET")
    access_key_id = require_environment("CM_VISUALIZER_R2_ACCESS_KEY_ID")
    secret_access_key = require_environment(
        "CM_VISUALIZER_R2_SECRET_ACCESS_KEY"
    )
    s3 = boto3.client(
        "s3",
        endpoint_url=endpoint,
        region_name="auto",
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
    )

    try:
        model = pretrained.get_model(args.model)
        samplerate = int(model.samplerate)
        audio_channels = int(model.audio_channels)
        source_names = list(model.sources)
    except Exception as error:
        print(
            f"Could not load Demucs model {args.model}: {error}",
            file=sys.stderr,
        )
        return 2

    processed: list[str] = []
    failures: list[dict[str, str]] = []
    working_directory = report_path.parent / "decoded"
    working_directory.mkdir(parents=True, exist_ok=True)

    for index, job in enumerate(jobs, start=1):
        track_id = str(job["trackId"])
        audio_path = Path(job["audioPath"])
        decoded_path = working_directory / (
            hashlib.sha256(track_id.encode("utf-8")).hexdigest() + ".decoded.wav"
        )
        output_path = Path(job["outputPath"])

        print(
            f"[{index}/{len(jobs)}] analyzing local file: {track_id}",
            flush=True,
        )

        try:
            if not audio_path.is_file():
                raise RuntimeError(f"Local audio file disappeared: {audio_path}")
            transcode_for_demucs(
                audio_path,
                decoded_path,
                ffmpeg_executable,
                samplerate,
            )

            audio_array, decoded_samplerate = sf.read(
                str(decoded_path),
                dtype="float32",
                always_2d=True,
            )
            if int(decoded_samplerate) != samplerate:
                raise RuntimeError(
                    "Decoded audio sample rate does not match the Demucs model: "
                    f"{decoded_samplerate} != {samplerate}."
                )

            origin = torch.from_numpy(audio_array.T.copy())
            if origin.ndim != 2 or origin.shape[0] != audio_channels:
                raise RuntimeError(
                    "Decoded audio channel count does not match the Demucs model: "
                    f"{tuple(origin.shape)}; expected {audio_channels} channel(s)."
                )

            reference = origin.mean(0)
            reference_mean = reference.mean()
            reference_std = reference.std() + 1e-8
            normalized = (origin - reference_mean) / reference_std

            separated = apply_model(
                model,
                normalized[None],
                shifts=args.shifts,
                split=True,
                overlap=0.25,
                progress=False,
                device=device,
            )[0]
            separated = separated * reference_std + reference_mean
            stems = dict(zip(source_names, separated))

            if "vocals" not in stems:
                raise RuntimeError(
                    "The selected Demucs model did not return a vocals stem."
                )

            vocals_tensor = stems["vocals"]
            instrument_tensors = {
                name: source
                for name, source in stems.items()
                if name != "vocals"
            }
            if not instrument_tensors:
                raise RuntimeError(
                    "The selected Demucs model returned no instrumental stems."
                )

            mix = mono_numpy(origin)
            vocals = mono_numpy(vocals_tensor)
            instrument_stems = {
                name: stereo_numpy(source, np)
                for name, source in instrument_tensors.items()
            }
            length = min(
                [len(mix), len(vocals)]
                + [stem.shape[-1] for stem in instrument_stems.values()]
            )
            mix = mix[:length]
            vocals = vocals[:length]
            instrument_stems = {
                name: stem[:, :length]
                for name, stem in instrument_stems.items()
            }

            bars, actual_fps, center_start, voice_count, duration = (
                build_bar_matrix(
                    mix,
                    vocals,
                    instrument_stems,
                    samplerate,
                    float(job["fps"]),
                    int(job["barCount"]),
                    int(job["voiceBars"]),
                    np,
                    librosa,
                )
            )
            payload = encode_payload(
                bars,
                actual_fps,
                center_start,
                voice_count,
                duration,
                args.model,
                np,
            )
            write_json(output_path, payload)

            metadata = {
                str(key): str(value)
                for key, value in dict(
                    job.get("uploadMetadata", {})
                ).items()
            }
            s3.put_object(
                Bucket=bucket,
                Key=str(job["objectKey"]),
                Body=output_path.read_bytes(),
                ContentType="application/json; charset=utf-8",
                CacheControl="public, max-age=300",
                Metadata=metadata,
            )

            processed.append(track_id)
            print(
                f"[{index}/{len(jobs)}] uploaded: {track_id} "
                f"({bars.shape[1]} frames)",
                flush=True,
            )
        except Exception as error:
            failures.append(
                {
                    "trackId": track_id,
                    "error": str(error),
                }
            )
            print(
                f"[{index}/{len(jobs)}] failed: {track_id}: {error}",
                file=sys.stderr,
                flush=True,
            )
        finally:
            try:
                decoded_path.unlink(missing_ok=True)
            except OSError:
                pass
            release_cuda(torch)
            checkpoint_report(
                report_path,
                model=args.model,
                device=device,
                processed=processed,
                failures=failures,
                total=len(jobs),
            )

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
