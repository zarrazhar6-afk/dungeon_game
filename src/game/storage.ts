import { GameSaveData, UpgradeLevels } from '../types';

const SAVE_KEY = 'pixel_dungeon_dragons_crown_save_v1';

export const DEFAULT_UPGRADES: UpgradeLevels = {
  sword: 1,
  armor: 1,
  health: 1,
  shield: 1,
};

export const DEFAULT_SAVE: GameSaveData = {
  currentLevel: 1,
  highestLevelUnlocked: 1,
  coins: 0,
  upgrades: { ...DEFAULT_UPGRADES },
  potions: 2,
  unlockedDragonSlayer: false,
  gameBeaten: false,
  highScoreEnemies: 0,
};

export function loadGameSave(): GameSaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    return {
      currentLevel: parsed.currentLevel || 1,
      highestLevelUnlocked: parsed.highestLevelUnlocked || 1,
      coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
      upgrades: {
        sword: parsed.upgrades?.sword || 1,
        armor: parsed.upgrades?.armor || 1,
        health: parsed.upgrades?.health || 1,
        shield: parsed.upgrades?.shield || 1,
      },
      potions: typeof parsed.potions === 'number' ? parsed.potions : 2,
      unlockedDragonSlayer: !!parsed.unlockedDragonSlayer,
      gameBeaten: !!parsed.gameBeaten,
      highScoreEnemies: parsed.highScoreEnemies || 0,
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function saveGameData(data: GameSaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save game data to localStorage', err);
  }
}

export function hasExistingSave(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return (
      parsed.currentLevel > 1 ||
      parsed.coins > 0 ||
      parsed.upgrades?.sword > 1 ||
      parsed.upgrades?.armor > 1 ||
      parsed.upgrades?.health > 1 ||
      parsed.upgrades?.shield > 1 ||
      parsed.gameBeaten
    );
  } catch {
    return false;
  }
}

export function clearGameSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.warn('Failed to clear game save', err);
  }
}
