export type RepeatMode = "off" | "all" | "one";

export interface PreviousResult {
  id: string;
  restart: boolean;
}

export class RadioQueue {
  private ids: string[];
  private current: string | null;
  private planned: string[] = [];
  private shufflePool: string[] = [];
  private shuffleCycles = 0;
  private history: string[] = [];
  private replayTail: string[] = [];
  private played: Set<string>;
  private random: () => number;

  shuffle = false;
  repeat: RepeatMode = "off";

  constructor(ids: string[], currentId: string | null = null, random = Math.random) {
    this.ids = [...new Set(ids)];
    this.current = currentId && this.ids.includes(currentId) ? currentId : this.ids[0] ?? null;
    this.played = new Set(this.current ? [this.current] : []);
    this.random = random;
  }

  get currentId() {
    return this.current;
  }

  get hasPrevious() {
    return this.history.length > 0;
  }

  get hasNextManual() {
    return this.repeat === "one"
      ? this.planned.length > 0 || (this.shuffle
        ? this.ids.some((id) => !this.played.has(id))
        : this.ids.indexOf(this.current ?? "") < this.ids.length - 1)
      : this.upcoming(1).length > 0;
  }

  setTracks(ids: string[]) {
    this.ids = [...new Set(ids)];
    if (!this.current || !this.ids.includes(this.current)) {
      this.current = this.ids[0] ?? null;
    }
    this.played = new Set([...this.played].filter((id) => this.ids.includes(id)));
    if (this.current) this.played.add(this.current);
    this.history = this.history.filter((id) => this.ids.includes(id));
    this.replayTail = this.replayTail.filter((id) => this.ids.includes(id) && id !== this.current && this.played.has(id));
    this.resetPlan();
  }

  select(id: string) {
    if (!this.ids.includes(id)) return false;
    if (this.current && this.current !== id) {
      this.history.push(this.current);
      if (this.shuffle) this.moveToTail(this.current);
    }
    this.current = id;
    this.played.add(id);
    this.replayTail = this.replayTail.filter((entry) => entry !== id);
    this.resetPlan();
    return true;
  }

  setShuffle(enabled: boolean) {
    if (this.shuffle === enabled) return;
    this.shuffle = enabled;
    this.resetPlan();
  }

  setRepeat(mode: RepeatMode) {
    if (this.repeat === mode) return;
    this.repeat = mode;
    this.resetPlan();
  }

  reshuffle(random: () => number = Math.random) {
    const candidates = this.ids.length > 1
      ? this.ids.filter((id) => id !== this.current)
      : this.ids;
    this.random = random;
    this.current = candidates[Math.floor(random() * candidates.length)] ?? null;
    this.played = new Set(this.current ? [this.current] : []);
    this.history = [];
    this.replayTail = [];
    this.shuffle = true;
    this.repeat = "off";
    this.resetPlan();
  }

  upcoming(count = 10): string[] {
    if (!this.current || count <= 0) return [];
    if (this.repeat === "one") return Array(count).fill(this.current) as string[];
    this.fillPlan(count);
    return this.planned.slice(0, count);
  }

  following(): string[] {
    if (!this.current) return [];
    if (this.repeat === "one") return [this.current];
    const automatic = this.upcoming(this.ids.length);
    if (!this.shuffle || this.repeat === "all") return automatic;
    const automaticIds = new Set(automatic);
    return [
      ...automatic,
      ...this.replayTail.filter((id) => id !== this.current && !automaticIds.has(id) && this.ids.includes(id))
    ];
  }

  next(manual = false): string | null {
    if (!this.current) return null;
    if (this.repeat === "one" && !manual) return this.current;
    if (this.repeat === "one" && manual) {
      const original = this.repeat;
      this.repeat = "off";
      const next = this.takeNext();
      this.repeat = original;
      this.resetPlan();
      return next;
    }
    return this.takeNext();
  }

  previous(elapsedSeconds: number): PreviousResult | null {
    if (!this.current) return null;
    if (elapsedSeconds > 3) return { id: this.current, restart: true };
    const previous = this.history.pop();
    if (!previous) return { id: this.current, restart: true };
    this.planned.unshift(this.current);
    this.replayTail = this.replayTail.filter((entry) => entry !== this.current && entry !== previous);
    this.current = previous;
    return { id: previous, restart: false };
  }

  private takeNext(): string | null {
    this.fillPlan(1);
    const next = this.planned.shift();
    if (!next || !this.current) return null;
    if (next !== this.current) {
      this.history.push(this.current);
      if (this.shuffle) this.moveToTail(this.current);
    }
    this.replayTail = this.replayTail.filter((entry) => entry !== next);
    this.current = next;
    this.played.add(next);
    return next;
  }

  private moveToTail(id: string) {
    this.replayTail = this.replayTail.filter((entry) => entry !== id);
    this.replayTail.push(id);
  }

  private fillPlan(count: number) {
    if (!this.current) return;
    while (this.planned.length < count) {
      if (this.shuffle) {
        if (this.shufflePool.length === 0) {
          if (this.shuffleCycles > 0 && this.repeat === "off") break;
          const last = this.planned.at(-1) ?? this.current;
          const candidates = this.shuffleCycles === 0
            ? this.ids.filter((id) => this.repeat === "off" ? !this.played.has(id) : id !== this.current)
            : [...this.ids];
          if (candidates.length === 0 && this.repeat === "all" && this.ids.length === 1) {
            candidates.push(this.ids[0]);
          }
          if (candidates.length === 0) break;
          this.shufflePool = this.shuffled(candidates);
          if (this.shufflePool.length > 1 && this.shufflePool[0] === last) {
            [this.shufflePool[0], this.shufflePool[1]] = [this.shufflePool[1], this.shufflePool[0]];
          }
          this.shuffleCycles += 1;
        }
        const next = this.shufflePool.shift();
        if (next) this.planned.push(next);
        continue;
      }

      const last = this.planned.at(-1) ?? this.current;
      const nextIndex = this.ids.indexOf(last) + 1;
      if (nextIndex >= this.ids.length && this.repeat === "off") break;
      const next = this.ids[nextIndex % this.ids.length];
      if (!next) break;
      this.planned.push(next);
    }
  }

  private shuffled(ids: string[]) {
    for (let index = ids.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(this.random() * (index + 1));
      [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
    }
    return ids;
  }

  private resetPlan() {
    this.planned = [];
    this.shufflePool = [];
    this.shuffleCycles = 0;
  }
}

export function createShuffledQueue(ids: string[], seed: number) {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const uniqueIds = [...new Set(ids)];
  const currentId = uniqueIds[Math.floor(random() * uniqueIds.length)] ?? null;
  const queue = new RadioQueue(uniqueIds, currentId, random);
  queue.setShuffle(true);
  return queue;
}
