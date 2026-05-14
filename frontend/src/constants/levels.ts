// Centralized constants matching the backend's level thresholds.
export const LEVELS = ['L1', 'L2', 'L3A', 'L3B', 'L4'] as const;

export const LEVEL_THRESHOLDS: Record<string, number> = {
  L1: 0,
  L2: 500,
  L3A: 1200,
  L3B: 2500,
  L4: 5000,
};

export const LEVEL_TITLES: Record<string, string> = {
  L1: 'Listener Initiate',
  L2: 'Resonance Apprentice',
  L3A: 'Space Holder',
  L3B: 'Resonance Conductor',
  L4: 'Harmonic Master',
};

export const LEVEL_THEMES: Record<string, string> = {
  L1: 'The Awakening of Listening',
  L2: 'The Body Becomes Resonance',
  L3A: 'The Space Holder',
  L3B: 'The Resonance Conductor',
  L4: 'The Harmonic Master',
};

export function levelBounds(level: string): { prev: number; next: number } {
  const idx = LEVELS.indexOf(level as typeof LEVELS[number]);
  const prev = LEVEL_THRESHOLDS[level] ?? 0;
  const nextLvl = LEVELS[idx + 1];
  const next = nextLvl ? LEVEL_THRESHOLDS[nextLvl] : prev + 1000;
  return { prev, next };
}
