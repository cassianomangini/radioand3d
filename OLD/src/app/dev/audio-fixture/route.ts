import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SAMPLE_RATE = 22050;
const DURATION_SECONDS = 8;

export function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  const requested = Number(request.nextUrl.searchParams.get("track"));
  const trackNumber = Number.isInteger(requested) && requested >= 1 && requested <= 12 ? requested : 1;
  const sampleCount = SAMPLE_RATE * DURATION_SECONDS;
  const dataLength = sampleCount * 2;
  const wav = Buffer.alloc(44 + dataLength);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + dataLength, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(SAMPLE_RATE, 24);
  wav.writeUInt32LE(SAMPLE_RATE * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(dataLength, 40);

  const root = 164.81 * Math.pow(2, (trackNumber - 1) / 12);
  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / SAMPLE_RATE;
    const beat = time % 0.5;
    const envelope = Math.min(1, beat * 20) * Math.exp(-beat * 4);
    const fade = Math.min(1, time * 4, (DURATION_SECONDS - time) * 4);
    const signal = (
      Math.sin(2 * Math.PI * root * time) * 0.45 +
      Math.sin(2 * Math.PI * root * 1.5 * time) * 0.23 +
      Math.sin(2 * Math.PI * root * 2 * time) * 0.12
    ) * envelope * fade;
    wav.writeInt16LE(Math.round(signal * 22000), 44 + index * 2);
  }

  return new NextResponse(wav, {
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": String(wav.length),
      "Cache-Control": "no-store"
    }
  });
}
