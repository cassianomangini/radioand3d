"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { createShuffledQueue } from "./queue";

export interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  artwork?: string;
  durationSeconds?: number;
  fixture?: boolean;
  visualizerAnalysisSrc?: string;
}

export type PlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "buffering"
  | "ended"
  | "blocked"
  | "error";

interface RadioContextValue {
  tracks: RadioTrack[];
  currentTrack: RadioTrack | null;
  upcomingTracks: RadioTrack[];
  status: PlaybackStatus;
  error: string | null;
  position: number;
  duration: number;
  volume: number;
  repeatOne: boolean;
  canSkipNext: boolean;
  hasPrevious: boolean;
  analyserReady: boolean;
  analyserUnavailable: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  select: (id: string) => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeatOne: () => void;
  reshuffle: () => void;
  retry: () => void;
  getAnalyser: () => AnalyserNode | null;
  getCurrentTime: () => number;
}

const RadioContext = createContext<RadioContextValue | null>(null);

function mediaErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "O navegador bloqueou a reprodução. Toque em Tocar novamente.";
  }
  return "Não foi possível reproduzir esta faixa. Tente novamente.";
}

export function RadioProvider({ children, tracks, playlistSeed }: { children: ReactNode; tracks: RadioTrack[]; playlistSeed: number }) {
  const [queue] = useState(() => createShuffledQueue(tracks.map((track) => track.id), playlistSeed));
  const audioRef = useRef<HTMLAudioElement>(null);
  const graphRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef(0);
  const [currentId, setCurrentId] = useState(queue.currentId);
  const [upcomingIds, setUpcomingIds] = useState(() => queue.following());
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const lastAudibleVolumeRef = useRef(1);
  const [repeatOne, setRepeatOne] = useState(false);
  const [canSkipNext, setCanSkipNext] = useState(queue.hasNextManual);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [analyserReady, setAnalyserReady] = useState(false);
  const [analyserUnavailable, setAnalyserUnavailable] = useState(false);

  const trackById = useMemo(
    () => new Map(tracks.map((track) => [track.id, track])),
    [tracks]
  );
  const currentTrack = currentId ? trackById.get(currentId) ?? null : null;
  const upcomingTracks = upcomingIds.flatMap((id) => {
    const track = trackById.get(id);
    return track ? [track] : [];
  });

  const refreshQueue = useCallback(() => {
    setCurrentId(queue.currentId);
    setUpcomingIds(queue.following());
    setHasPrevious(queue.hasPrevious);
    setRepeatOne(queue.repeat === "one");
    setCanSkipNext(queue.hasNextManual);
  }, [queue]);

  const ensureGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current || graphRef.current) return;
    let context: AudioContext | null = null;
    let source: MediaElementAudioSourceNode | null = null;
    try {
      context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0;
      analyser.minDecibels = -100;
      analyser.maxDecibels = -10;
      source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);
      graphRef.current = context;
      analyserRef.current = analyser;
      setAnalyserUnavailable(false);
      setAnalyserReady(true);
      void context.resume().catch(() => {
        if (graphRef.current === context) setAnalyserUnavailable(true);
      });
    } catch {
      if (source && context) {
        try {
          source.disconnect();
          source.connect(context.destination);
          graphRef.current = context;
          void context.resume().catch(() => undefined);
        } catch {
          void context.close();
        }
      } else if (context) {
        void context.close();
      }
      setAnalyserUnavailable(true);
      // The media element keeps playing if Web Audio is unavailable.
    }
  }, []);

  const loadCurrent = useCallback(() => {
    const audio = audioRef.current;
    const track = queue.currentId ? trackById.get(queue.currentId) : null;
    if (!audio || !track) return false;
    if (audio.getAttribute("src") !== track.src) {
      requestRef.current += 1;
      audio.pause();
      audio.src = track.src;
      audio.load();
      setPosition(0);
      setDuration(track.durationSeconds ?? 0);
    }
    return true;
  }, [queue, trackById]);

  const play = useCallback(() => {
    if (!loadCurrent()) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.ended) {
      audio.currentTime = 0;
      setPosition(0);
    }
    ensureGraph();
    void graphRef.current?.resume().catch(() => undefined);
    const request = ++requestRef.current;
    setError(null);
    setStatus("loading");
    void audio.play().then(() => {
      if (request === requestRef.current && !audio.paused) setStatus("playing");
    }).catch((cause: unknown) => {
      if (request !== requestRef.current) return;
      setError(mediaErrorMessage(cause));
      setStatus(cause instanceof DOMException && cause.name === "NotAllowedError" ? "blocked" : "error");
    });
  }, [ensureGraph, loadCurrent]);

  const pause = useCallback(() => {
    requestRef.current += 1;
    audioRef.current?.pause();
    setStatus((current) => current === "idle" ? current : "paused");
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (status === "loading" || status === "buffering" || (audio && !audio.paused)) pause();
    else play();
  }, [pause, play, status]);

  const switchToCurrent = useCallback(() => {
    refreshQueue();
    if (loadCurrent()) play();
  }, [loadCurrent, play, refreshQueue]);

  const select = useCallback((id: string) => {
    if (!queue.select(id)) return;
    switchToCurrent();
  }, [queue, switchToCurrent]);

  const advance = useCallback((manual: boolean) => {
    const nextId = queue.next(manual);
    if (!nextId) {
      requestRef.current += 1;
      audioRef.current?.pause();
      setStatus("ended");
      refreshQueue();
      return;
    }
    const audio = audioRef.current;
    if (audio && audio.getAttribute("src") === trackById.get(nextId)?.src) {
      audio.currentTime = 0;
      setPosition(0);
    }
    switchToCurrent();
  }, [queue, refreshQueue, switchToCurrent, trackById]);

  const next = useCallback(() => advance(true), [advance]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    const result = queue.previous(audio?.currentTime ?? 0);
    if (!result) return;
    if (result.restart && audio) {
      audio.currentTime = 0;
      setPosition(0);
      play();
      return;
    }
    switchToCurrent();
  }, [play, queue, switchToCurrent]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(seconds, 0), audio.duration);
    setPosition(audio.currentTime);
  }, []);

  const setVolume = useCallback((value: number) => {
    if (!Number.isFinite(value)) return;
    const nextVolume = Math.min(Math.max(value, 0), 1);
    if (nextVolume > 0) lastAudibleVolumeRef.current = nextVolume;
    if (audioRef.current) audioRef.current.volume = nextVolume;
    setVolumeState(nextVolume);
  }, []);

  const toggleMute = useCallback(() => {
    setVolume(volume === 0 ? lastAudibleVolumeRef.current : 0);
  }, [setVolume, volume]);

  const toggleRepeatOne = useCallback(() => {
    queue.setRepeat(queue.repeat === "one" ? "off" : "one");
    refreshQueue();
  }, [queue, refreshQueue]);

  const reshuffle = useCallback(() => {
    const wasPlaying = status === "playing" || status === "loading" || status === "buffering";
    queue.reshuffle();
    if (audioRef.current?.getAttribute("src")) audioRef.current.currentTime = 0;
    setPosition(0);
    setError(null);
    if (wasPlaying) {
      switchToCurrent();
      return;
    }
    requestRef.current += 1;
    audioRef.current?.pause();
    loadCurrent();
    setStatus(queue.currentId && status !== "idle" ? "paused" : "idle");
    refreshQueue();
  }, [loadCurrent, queue, refreshQueue, status, switchToCurrent]);

  const retry = useCallback(() => {
    audioRef.current?.load();
    play();
  }, [play]);

  const getAnalyser = useCallback(() => analyserRef.current, []);
  const getCurrentTime = useCallback(() => audioRef.current?.currentTime ?? 0, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      requestRef.current += 1;
      audio?.pause();
      void graphRef.current?.close();
      graphRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  const value: RadioContextValue = {
    tracks, currentTrack, upcomingTracks, status, error, position, duration, volume, repeatOne, canSkipNext,
    hasPrevious, analyserReady, analyserUnavailable, play, pause, toggle, select, next, previous,
    seek, setVolume, toggleMute, toggleRepeatOne, reshuffle, retry, getAnalyser, getCurrentTime
  };

  return (
    <RadioContext.Provider value={value}>
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        onPlaying={(event) => {
          if (!event.currentTarget.paused) setStatus("playing");
        }}
        onPause={() => setStatus((current) => current === "playing" || current === "buffering" ? "paused" : current)}
        onWaiting={() => setStatus((current) => current === "playing" ? "buffering" : current)}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onDurationChange={(event) => {
          const nextDuration = event.currentTarget.duration;
          setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
        }}
        onEnded={() => advance(false)}
        onError={(event) => {
          const expectedSrc = queue.currentId ? trackById.get(queue.currentId)?.src : null;
          if (!expectedSrc || event.currentTarget.getAttribute("src") !== expectedSrc) return;
          requestRef.current += 1;
          setError("Não foi possível carregar esta faixa. Tente novamente.");
          setStatus("error");
        }}
      />
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (!context) throw new Error("useRadio must be used inside RadioProvider");
  return context;
}
