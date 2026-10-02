#!/usr/bin/env python3
"""Build synchronized musical visualizer sidecars for CM Radio.

The expensive source separation happens offline. The browser only reads compact,
quantized bar frames synchronized to the existing audio element currentTime.
"""

from __future__ import annotations

import argparse
import base64
import gc
import json
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
    temporary.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    temporary.replace(path)


def mono_numpy(tensor: Any) -> Any:
    array = tensor.detach().cpu().numpy()
    if array.ndim == 1:
        return array.astype("float32", copy=False)
    return array.mean(axis=0).astype("float32", copy=False)


def relative_db(power: Any, np: Any) -> Any:
    safe = np.maximum(power, 1e-12)
    db = 10.0 * np.log10(safe)
    peak = float(np.max(db)) if db.size else 0.0
    return db - peak


def robust_band_normalize(power: Any, np: Any, floor_db: float = -66.0, strong_db: float = -34.0) -> Any:
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
    edge = values[..., -1:] if values.shape[-1] else np.zeros((*values.shape[:-1], 1), dtype=np.float32)
    return np.concatenate([values, np.repeat(edge, padding, axis=-1)], axis=-1)


def build_bar_matrix(
    mix: Any,
    vocals: Any,
    instruments: Any,
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

    hop_length = max(256, int(round(sample_rate / fps)))
    actual_fps = sample_rate / hop_length
    n_fft = 2048 if sample_rate >= 24_000 else 1024
    fmax = min(18_000.0, sample_rate * 0.48)
    outer_count = bar_count - voice_count
    side_count = outer_count // 2

    instrument_stft = librosa.stft(instruments, n_fft=n_fft, hop_length=hop_length, center=True)
    instrument_mag = np.abs(instrument_stft)
    harmonic_mag, percussive_mag = librosa.decompose.hpss(instrument_mag)
    mel_basis = librosa.filters.mel(
        sr=sample_rate,
        n_fft=n_fft,
        n_mels=outer_count,
        fmin=40.0,
        fmax=fmax,
        norm="slaney",
    )
    full_power = mel_basis @ np.square(instrument_mag)
    harmonic_power = mel_basis @ np.square(harmonic_mag)
    percussive_power = mel_basis @ np.square(percussive_mag)

    full_norm = robust_band_normalize(full_power, np)
    harmonic_norm = robust_band_normalize(harmonic_power, np)
    percussive_norm = robust_band_normalize(percussive_power, np)
    full_db = relative_db(full_power, np)
    flux = np.maximum(0.0, np.diff(full_db, axis=1, prepend=full_db[:, :1]))
    flux_norm = robust_event_normalize(flux, np)

    instrument_levels = np.maximum.reduce([
        full_norm * 0.70,
        harmonic_norm * 0.92,
        percussive_norm * 0.98,
    ])
    instrument_levels = np.clip(instrument_levels + flux_norm * 0.28, 0.0, 1.0)

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
    voice_norm = robust_band_normalize(voice_power, np, floor_db=-62.0, strong_db=-30.0)

    frame_count = min(instrument_levels.shape[1], voice_norm.shape[1])
    instrument_levels = fit_frames(instrument_levels, frame_count, np)
    voice_norm = fit_frames(voice_norm, frame_count, np)

    mix_rms = fit_frames(rms_frames(mix, librosa, n_fft, hop_length), frame_count, np)
    voice_rms = fit_frames(rms_frames(vocals, librosa, n_fft, hop_length), frame_count, np)
    mix_peak = max(float(np.max(mix_rms)), 1e-6)
    absolute_voice = np.clip((20.0 * np.log10(np.maximum(voice_rms / mix_peak, 1e-6)) + 58.0) / 28.0, 0.0, 1.0)
    voice_ratio = voice_rms / np.maximum(mix_rms, 1e-6)
    voice_presence = np.clip((voice_ratio - 0.06) / 0.30, 0.0, 1.0) * absolute_voice
    voice_levels = np.clip(
        np.maximum(voice_norm * voice_presence[None, :], voice_presence[None, :] * 0.22),
        0.0,
        1.0,
    )

    bars = np.zeros((bar_count, frame_count), dtype=np.float32)
    for index in range(side_count):
        bars[index, :] = instrument_levels[index * 2, :]
        bars[bar_count - 1 - index, :] = instrument_levels[index * 2 + 1, :]

    center_start = side_count
    bars[center_start:center_start + voice_count, :] = voice_levels

    bars = np.power(np.clip(bars, 0.0, 1.0), 0.82)
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
    quantized = np.rint(np.clip(bars.T, 0.0, 1.0) * 255.0).astype(np.uint8)
    packed = base64.b64encode(quantized.tobytes(order="C")).decode("ascii")
    return {
        "version": 1,
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


def main() -> int:
    args = parse_args()

    try:
        import librosa
        import numpy as np
        import torch
        from demucs.api import Separator
    except ImportError as error:
        print(
            "Visualizer dependencies are missing. Run: "
            "python -m pip install -r scripts/requirements-visualizer-analysis.txt",
            file=sys.stderr,
        )
        print(str(error), file=sys.stderr)
        return 2

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    jobs = manifest.get("jobs", [])
    report_path = Path(manifest["reportPath"])
    if not jobs:
        write_json(report_path, {"processed": [], "failed": []})
        return 0

    device = "cuda" if args.device == "auto" and torch.cuda.is_available() else args.device
    if device == "auto":
        device = "cpu"
    if device == "cuda" and not torch.cuda.is_available():
        print("CUDA was requested but torch.cuda.is_available() is false.", file=sys.stderr)
        return 2

    try:
        separator = Separator(
            model=args.model,
            device=device,
            shifts=args.shifts,
            split=True,
            overlap=0.25,
            progress=False,
        )
    except Exception as error:
        print(f"Could not load Demucs model {args.model}: {error}", file=sys.stderr)
        return 2

    processed: list[str] = []
    failures: list[dict[str, str]] = []

    for job in jobs:
        track_id = str(job["trackId"])
        try:
            origin, stems = separator.separate_audio_file(Path(job["audioPath"]))
            if "vocals" not in stems:
                raise RuntimeError("The selected Demucs model did not return a vocals stem.")
            vocals_tensor = stems["vocals"]
            instrument_tensors = [source for name, source in stems.items() if name != "vocals"]
            if not instrument_tensors:
                raise RuntimeError("The selected Demucs model returned no instrumental stems.")
            instruments_tensor = instrument_tensors[0].clone()
            for source in instrument_tensors[1:]:
                instruments_tensor += source

            mix = mono_numpy(origin)
            vocals = mono_numpy(vocals_tensor)
            instruments = mono_numpy(instruments_tensor)
            length = min(len(mix), len(vocals), len(instruments))
            mix, vocals, instruments = mix[:length], vocals[:length], instruments[:length]

            bars, actual_fps, center_start, voice_count, duration = build_bar_matrix(
                mix,
                vocals,
                instruments,
                separator.samplerate,
                float(job["fps"]),
                int(job["barCount"]),
                int(job["voiceBars"]),
                np,
                librosa,
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
            write_json(Path(job["outputPath"]), payload)
            processed.append(track_id)
            print(f"analyzed: {track_id} ({bars.shape[1]} frames)", flush=True)
        except Exception as error:
            failures.append({"trackId": track_id, "error": str(error)})
            print(f"analysis failed: {track_id}: {error}", file=sys.stderr, flush=True)
        finally:
            release_cuda(torch)

    write_json(
        report_path,
        {
            "model": args.model,
            "device": device,
            "processed": processed,
            "failed": failures,
        },
    )
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
