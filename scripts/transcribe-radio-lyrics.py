#!/usr/bin/env python3
"""Transcribe and force-align a batch of radio tracks with WhisperX.

The Node orchestration script owns caching and canonical-lyrics reconciliation.
This helper only turns audio into word timestamps and keeps the expensive models
loaded across the batch.
"""

from __future__ import annotations

import argparse
import gc
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate WhisperX word timestamps for CM Radio tracks.")
    parser.add_argument("manifest", type=Path, help="JSON manifest written by sync-radio-lyrics.mjs")
    parser.add_argument("--model", default="large-v3")
    parser.add_argument("--device", choices=("auto", "cpu", "cuda"), default="auto")
    parser.add_argument("--compute-type", default="auto")
    parser.add_argument("--batch-size", type=int, default=8)
    return parser.parse_args()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def release_cuda(torch_module: Any) -> None:
    gc.collect()
    if torch_module.cuda.is_available():
        torch_module.cuda.empty_cache()


def main() -> int:
    args = parse_args()

    try:
        import torch
        import whisperx
    except ImportError as error:
        print(
            "WhisperX dependencies are missing. Run: "
            "python -m pip install -r scripts/requirements-lyrics-sync.txt",
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

    compute_type = args.compute_type
    if compute_type == "auto":
        compute_type = "float16" if device == "cuda" else "int8"

    transcripts: dict[str, dict[str, Any]] = {}
    failures: list[dict[str, str]] = []

    try:
        asr_model = whisperx.load_model(args.model, device, compute_type=compute_type)
    except Exception as error:
        print(f"Could not load WhisperX model {args.model}: {error}", file=sys.stderr)
        return 2

    for job in jobs:
        track_id = str(job["trackId"])
        audio_path = str(job["audioPath"])
        try:
            audio = whisperx.load_audio(audio_path)
            result = asr_model.transcribe(audio, batch_size=args.batch_size)
            language = result.get("language")
            segments = result.get("segments", [])
            if not language or not segments:
                raise RuntimeError("WhisperX returned no language or segments.")
            transcripts[track_id] = {
                "job": job,
                "language": language,
                "segments": segments,
            }
            print(f"transcribed: {track_id} ({language})", flush=True)
        except Exception as error:
            failures.append({"trackId": track_id, "stage": "transcribe", "error": str(error)})
            print(f"transcription failed: {track_id}: {error}", file=sys.stderr, flush=True)

    del asr_model
    release_cuda(torch)

    by_language: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in transcripts.values():
        by_language[str(item["language"])].append(item)

    processed: list[str] = []
    for language, items in by_language.items():
        try:
            align_model, metadata = whisperx.load_align_model(language_code=language, device=device)
        except Exception as error:
            for item in items:
                failures.append({
                    "trackId": str(item["job"]["trackId"]),
                    "stage": "align-model",
                    "error": str(error),
                })
            print(f"alignment model failed for {language}: {error}", file=sys.stderr, flush=True)
            continue

        for item in items:
            job = item["job"]
            track_id = str(job["trackId"])
            try:
                audio = whisperx.load_audio(str(job["audioPath"]))
                aligned = whisperx.align(
                    item["segments"],
                    align_model,
                    metadata,
                    audio,
                    device,
                    return_char_alignments=False,
                )
                output = {
                    "language": language,
                    "segments": aligned.get("segments", []),
                    "word_segments": aligned.get("word_segments", []),
                }
                write_json(Path(job["outputPath"]), output)
                processed.append(track_id)
                print(f"aligned: {track_id}", flush=True)
            except Exception as error:
                failures.append({"trackId": track_id, "stage": "align", "error": str(error)})
                print(f"alignment failed: {track_id}: {error}", file=sys.stderr, flush=True)

        del align_model
        release_cuda(torch)

    write_json(
        report_path,
        {
            "model": args.model,
            "device": device,
            "computeType": compute_type,
            "processed": processed,
            "failed": failures,
        },
    )
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
