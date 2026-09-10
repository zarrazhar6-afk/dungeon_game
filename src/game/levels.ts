import { LevelConfig, Platform, Trap, Chest, Door, EnemyType } from '../types';
import { WORLD1_LEVELS } from './levels_world1';
import { WORLD2_LEVELS } from './levels_world2';
import { WORLD3_LEVELS } from './levels_world3';

export interface LevelData {
  config: LevelConfig;
  platforms: Platform[];
  traps: Trap[];
  chests: Chest[];
  door: Door;
  torches: { x: number; y: number }[];
  enemies: {
    id: string;
    type: EnemyType;
    x: number;
    y: number;
    patrolMinX: number;
    patrolMaxX: number;
  }[];
  princess?: { x: number; y: number };
}

export const LEVELS: LevelData[] = [
  ...WORLD1_LEVELS,
  ...WORLD2_LEVELS,
  ...WORLD3_LEVELS,
];

export function getLevelData(id: number): LevelData | undefined {
  return LEVELS.find((l) => l.config.id === id);
}

export function getWorldForLevel(levelId: number): number {
  if (levelId <= 10) return 1;
  if (levelId <= 20) return 2;
  return 3;
}
