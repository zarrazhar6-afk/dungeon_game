export type WeaponType = 'sword' | 'bow' | 'staff';
export type ElementType = 'fire' | 'ice' | 'lightning';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  blockPercent: number;
  coins: number;
  potions: number;
  maxPotions: number;
  activeWeapon: WeaponType;
  activeElement: ElementType;
  elementSkillCooldown: number;
  maxSkillCooldown: number;
}

export interface UpgradeLevels {
  sword: number;  // 1 to 10
  armor: number;  // 1 to 10
  health: number; // 1 to 10
  shield: number; // 1 to 10
}

export interface UpgradeTier {
  level: number;
  name: string;
  cost: number;
  statBonus: number;
  description: string;
  color: string;
}

export type EnemyType = 
  // Map 1: Goblins & Dragon Drakon
  | 'warrior' 
  | 'archer' 
  | 'elite' 
  | 'dragon'
  // Map 2: Wizards & Sorcerer Archmage
  | 'apprentice_mage'
  | 'pyro_sorcerer'
  | 'frost_necromancer'
  | 'wizard_boss'
  // Map 3: Demons & Lucifer
  | 'nether_imp'
  | 'demon_hound'
  | 'hell_knight'
  | 'lucifer';

export interface EnemyStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  rewardCoins: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
  type?: 'spark' | 'smoke' | 'blood' | 'fire' | 'gold' | 'heart' | 'ring';
}

export interface DamageNumber {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  isCrit?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  fromPlayer: boolean;
  type: 'arrow' | 'fireball' | 'flame' | 'slash' | 'arcane_orb' | 'ice_shard' | 'lightning_strike' | 'hellfire' | 'dark_scythe';
  life: number;
  element?: ElementType;
  isPiercing?: boolean;
  isExplosive?: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'stone' | 'bridge' | 'moving' | 'ladder';
  moveRange?: number;
  moveSpeed?: number;
  initialX?: number;
  initialY?: number;
  moveAxis?: 'x' | 'y';
}

export interface Trap {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spikes' | 'lava' | 'fireJet';
  damage: number;
  active?: boolean;
  timer?: number;
}

export interface Chest {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opened: boolean;
  coins: number;
  hasPotion: boolean;
}

export interface Door {
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  label: string;
}

export interface CoinDrop {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  collected: boolean;
  life: number;
}

export type LevelTheme = 
  // Map 1: Goblins & Drakon
  | 'forgotten_gate' 
  | 'goblin_cave' 
  | 'dark_fortress' 
  | 'dragons_castle' 
  | 'dragons_lair'
  // Map 2: Sorcerers & Archmage
  | 'sorcerer_library'
  | 'arcane_sanctum'
  | 'celestial_observatory'
  | 'grand_spire'
  // Map 3: Demons & Lucifer
  | 'abyssal_ruins'
  | 'brimstone_chasm'
  | 'infernal_citadel'
  | 'throne_of_lucifer';

export interface LevelConfig {
  id: number;
  name: string;
  subName: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Very Hard' | 'EXTREME';
  theme: LevelTheme;
  description: string;
  targetEnemies: number;
  rewardBase: number;
  width: number;
  height: number;
  playerStartX: number;
  playerStartY: number;
  doorX: number;
  doorY: number;
}

export interface GameSaveData {
  currentLevel: number;
  highestLevelUnlocked: number;
  coins: number;
  upgrades: UpgradeLevels;
  potions: number;
  unlockedDragonSlayer: boolean;
  gameBeaten: boolean;
  highScoreEnemies: number;
}

export type GameState = 
  | 'menu'
  | 'playing'
  | 'paused'
  | 'map_select'
  | 'upgrade_shop'
  | 'how_to_play'
  | 'settings'
  | 'level_complete'
  | 'game_over'
  | 'cutscene_victory';

export interface LevelStats {
  coinsEarned: number;
  enemiesDefeated: number;
  timeSeconds: number;
  bonus: number;
}

export interface WorldInfo {
  id: number;
  name: string;
  subTitle: string;
  description: string;
  bossName: string;
  bossTitle: string;
  minLevel: number;
  maxLevel: number;
  icon: string;
  color: string;
  accentBorder: string;
}

export const WORLD_DEFINITIONS: WorldInfo[] = [
  {
    id: 1,
    name: 'KASTIL DRAKON',
    subTitle: 'Goblin Citadel & Dragon Lair',
    description: 'Ancient dungeon tunnels infested by goblin hordes, guarded by the great dragon Drakon.',
    bossName: 'DRAKON',
    bossTitle: 'The Ancient Dungeon Dragon',
    minLevel: 1,
    maxLevel: 10,
    icon: '🐉',
    color: '#f59e0b',
    accentBorder: 'border-amber-500/60',
  },
  {
    id: 2,
    name: 'MENARA PENYIHIR',
    subTitle: "The Sorcerer's Spire",
    description: 'Mystical high towers filled with teleporting apprentice mages, pyro-casters, and icy necromancers.',
    bossName: 'ARCHMAGE MORVATH',
    bossTitle: 'Grand Master of Arcane Arts',
    minLevel: 11,
    maxLevel: 20,
    icon: '🧙‍♂️',
    color: '#a855f7',
    accentBorder: 'border-purple-500/60',
  },
  {
    id: 3,
    name: 'ALAM DEMON ABYSS',
    subTitle: 'The Abyssal Nether',
    description: 'Nightmarish volcanic chasms populated by nether imps, hellhounds, and demonic hell knights.',
    bossName: 'LUCIFER',
    bossTitle: 'Lord of the Burning Abyss',
    minLevel: 21,
    maxLevel: 30,
    icon: '👿',
    color: '#ef4444',
    accentBorder: 'border-red-500/60',
  },
];
