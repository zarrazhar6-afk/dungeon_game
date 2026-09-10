import {
  PlayerStats,
  UpgradeLevels,
  Particle,
  DamageNumber,
  Projectile,
  CoinDrop,
  LevelStats,
  EnemyType,
  WeaponType,
  ElementType,
} from '../types';
import { SWORD_UPGRADES, ARMOR_UPGRADES, HEALTH_UPGRADES, SHIELD_UPGRADES } from './constants';
import { LEVELS, LevelData } from './levels';
import { audio } from './audio';
import { PixelRenderer } from './pixelRenderer';
import { EnemyAI } from './enemyAI';
import { EnemyRenderer } from './pixelRendererEnemies';

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  facingRight: boolean;
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'dead';
  patrolMinX: number;
  patrolMaxX: number;
  attackCooldown: number;
  hurtTimer: number;
  animFrame: number;
  // Boss & specific features
  dragonPhase?: 1 | 2 | 3;
  attackMode?: 'idle' | 'claw' | 'bite' | 'fire_breath' | 'flying' | 'cleave';
  flightY?: number;
  specialTimer?: number;
  shieldHp?: number;
  teleportTimer?: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  // Level & World
  public currentLevelIndex: number = 0;
  public currentLevel: LevelData;
  public cameraX: number = 0;
  public cameraY: number = 0;

  // Player
  public px: number = 0;
  public py: number = 0;
  public pvx: number = 0;
  public pvy: number = 0;
  public pFacingRight: boolean = true;
  public pGrounded: boolean = false;
  public pAnimState: 'idle' | 'walk' | 'jump' | 'attack' | 'heavy_attack' | 'block' | 'hurt' | 'victory' = 'idle';
  public pAnimFrame: number = 0;
  public pHurtTimer: number = 0;
  public pAttackTimer: number = 0;
  public pDashTimer: number = 0;
  public pDashCooldown: number = 0;
  public pIsBlocking: boolean = false;
  public pInvulnerableTimer: number = 0;

  // Stats & Progress
  public upgrades: UpgradeLevels;
  public stats: PlayerStats;

  // Entities
  public enemies: EnemyEntity[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];
  public coinDrops: CoinDrop[] = [];

  // Dragon Boss Reference
  public dragonBoss: EnemyEntity | null = null;
  public princessRescued: boolean = false;

  // Game loop & Screenshake
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public screenShake: number = 0;
  public levelStartTime: number = 0;
  public levelEnemiesKilled: number = 0;
  public levelCoinsEarned: number = 0;

  // Input states
  public keys: { [key: string]: boolean } = {};

  // Callbacks
  public onLevelComplete?: (stats: LevelStats) => void;
  public onGameOver?: (stats: { enemiesDefeated: number; coinsCollected: number }) => void;
  public onVictory?: () => void;
  public onStatsChanged?: () => void;

  private getUpgradeIndex(val: number | undefined): number {
    const num = typeof val === 'number' && !isNaN(val) ? val : 1;
    return Math.max(0, Math.min(9, num - 1));
  }

  constructor(
    canvas: HTMLCanvasElement,
    initialLevelIndex: number,
    upgrades: UpgradeLevels,
    coins: number,
    potions: number,
    activeWeapon?: WeaponType,
    activeElement?: ElementType
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.upgrades = {
      sword: Math.max(1, Math.min(10, upgrades?.sword || 1)),
      armor: Math.max(1, Math.min(10, upgrades?.armor || 1)),
      health: Math.max(1, Math.min(10, upgrades?.health || 1)),
      shield: Math.max(1, Math.min(10, upgrades?.shield || 1)),
    };
    this.currentLevelIndex = initialLevelIndex;
    this.currentLevel = LEVELS[this.currentLevelIndex] || LEVELS[0];

    // Compute stats safely from upgrades
    const healthTier = HEALTH_UPGRADES[this.getUpgradeIndex(this.upgrades.health)] || HEALTH_UPGRADES[0];
    const swordTier = SWORD_UPGRADES[this.getUpgradeIndex(this.upgrades.sword)] || SWORD_UPGRADES[0];
    const armorTier = ARMOR_UPGRADES[this.getUpgradeIndex(this.upgrades.armor)] || ARMOR_UPGRADES[0];
    const shieldTier = SHIELD_UPGRADES[this.getUpgradeIndex(this.upgrades.shield)] || SHIELD_UPGRADES[0];

    const maxHp = healthTier.statBonus;
    this.stats = {
      hp: maxHp,
      maxHp: maxHp,
      attack: swordTier.statBonus,
      defense: armorTier.statBonus,
      speed: 4.2,
      blockPercent: (shieldTier.statBonus || 30) / 100,
      coins: typeof coins === 'number' && !isNaN(coins) ? coins : 0,
      potions: Math.min(3, typeof potions === 'number' ? potions : 2),
      maxPotions: 3,
      activeWeapon: activeWeapon || 'sword',
      activeElement: activeElement || 'fire',
      elementSkillCooldown: 0,
      maxSkillCooldown: 3.5,
    };

    this.initLevel(this.currentLevelIndex);
  }

  public updateUpgrades(upgrades: UpgradeLevels) {
    this.upgrades = {
      sword: Math.max(1, Math.min(10, upgrades?.sword || 1)),
      armor: Math.max(1, Math.min(10, upgrades?.armor || 1)),
      health: Math.max(1, Math.min(10, upgrades?.health || 1)),
      shield: Math.max(1, Math.min(10, upgrades?.shield || 1)),
    };
    const healthTier = HEALTH_UPGRADES[this.getUpgradeIndex(this.upgrades.health)] || HEALTH_UPGRADES[0];
    const swordTier = SWORD_UPGRADES[this.getUpgradeIndex(this.upgrades.sword)] || SWORD_UPGRADES[0];
    const armorTier = ARMOR_UPGRADES[this.getUpgradeIndex(this.upgrades.armor)] || ARMOR_UPGRADES[0];
    const shieldTier = SHIELD_UPGRADES[this.getUpgradeIndex(this.upgrades.shield)] || SHIELD_UPGRADES[0];

    const maxHp = healthTier.statBonus;
    const hpRatio = this.stats.maxHp > 0 ? this.stats.hp / this.stats.maxHp : 1;
    this.stats.maxHp = maxHp;
    this.stats.hp = Math.round(maxHp * Math.max(0.5, hpRatio));
    this.stats.attack = swordTier.statBonus;
    this.stats.defense = armorTier.statBonus;
    this.stats.blockPercent = (shieldTier.statBonus || 30) / 100;
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public initLevel(levelIndex: number) {
    this.currentLevelIndex = levelIndex;
    this.currentLevel = JSON.parse(JSON.stringify(LEVELS[levelIndex] || LEVELS[0]));

    this.px = this.currentLevel.config.playerStartX;
    this.py = this.currentLevel.config.playerStartY;
    this.cameraX = Math.max(0, Math.min(this.currentLevel.config.width - this.canvas.width, this.px - this.canvas.width / 2));
    this.cameraY = this.canvas.height < this.currentLevel.config.height
      ? Math.max(0, Math.min(this.currentLevel.config.height - this.canvas.height, this.py - this.canvas.height * 0.55))
      : -(this.canvas.height - this.currentLevel.config.height) / 2;
    this.pvx = 0;
    this.pvy = 0;
    this.pFacingRight = true;
    this.pGrounded = false;
    this.pAnimState = 'idle';
    this.pAttackTimer = 0;
    this.pHurtTimer = 0;
    this.pDashTimer = 0;
    this.pDashCooldown = 0;
    this.pIsBlocking = false;
    this.pInvulnerableTimer = 0;

    this.levelStartTime = Date.now();
    this.levelEnemiesKilled = 0;
    this.levelCoinsEarned = 0;
    this.princessRescued = false;

    this.projectiles = [];
    this.particles = [];
    this.damageNumbers = [];
    this.coinDrops = [];
    this.dragonBoss = null;

    // Spawn enemies
    this.enemies = this.currentLevel.enemies.map((e) => {
      let hp = 40;
      let atk = 8;
      let def = 2;
      let spd = 1.2;
      let width = 24;
      let height = 30;

      switch (e.type) {
        case 'archer':
          hp = 32;
          atk = 10;
          def = 1;
          spd = 1.0;
          break;
        case 'elite':
          hp = 85;
          atk = 16;
          def = 5;
          spd = 1.4;
          width = 32;
          height = 40;
          break;
        case 'dragon':
          hp = 1000;
          atk = 30;
          def = 10;
          spd = 1.5;
          width = 120;
          height = 80;
          break;
        // World 2: Wizards & Sorcerers
        case 'apprentice_mage':
          hp = 60;
          atk = 14;
          def = 3;
          spd = 1.1;
          width = 24;
          height = 32;
          break;
        case 'pyro_sorcerer':
          hp = 75;
          atk = 18;
          def = 4;
          spd = 1.2;
          width = 26;
          height = 34;
          break;
        case 'frost_necromancer':
          hp = 90;
          atk = 16;
          def = 6;
          spd = 1.0;
          width = 26;
          height = 34;
          break;
        case 'wizard_boss':
          hp = 1400;
          atk = 34;
          def = 12;
          spd = 1.5;
          width = 50;
          height = 65;
          break;
        // World 3: Demons & Hell
        case 'nether_imp':
          hp = 55;
          atk = 16;
          def = 2;
          spd = 1.8;
          width = 22;
          height = 24;
          break;
        case 'demon_hound':
          hp = 80;
          atk = 22;
          def = 4;
          spd = 2.2;
          width = 32;
          height = 24;
          break;
        case 'hell_knight':
          hp = 140;
          atk = 26;
          def = 10;
          spd = 1.3;
          width = 36;
          height = 48;
          break;
        case 'lucifer':
          hp = 2200;
          atk = 42;
          def = 16;
          spd = 1.6;
          width = 80;
          height = 90;
          break;
        default:
          // warrior
          hp = 40;
          atk = 8;
          def = 2;
          spd = 1.2;
          break;
      }

      const isBoss = e.type === 'dragon' || e.type === 'wizard_boss' || e.type === 'lucifer';

      const entity: EnemyEntity = {
        id: e.id,
        type: e.type,
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 0,
        width: width,
        height: height,
        hp: hp,
        maxHp: hp,
        attack: atk,
        defense: def,
        speed: spd,
        facingRight: false,
        state: 'patrol',
        patrolMinX: e.patrolMinX,
        patrolMaxX: e.patrolMaxX,
        attackCooldown: Math.random() * 1.5,
        hurtTimer: 0,
        animFrame: Math.random() * 10,
        dragonPhase: isBoss ? 1 : undefined,
        attackMode: isBoss ? 'idle' : undefined,
        flightY: e.type === 'dragon' ? 240 : undefined,
        specialTimer: 0,
        shieldHp: e.type === 'wizard_boss' ? 250 : undefined,
      };

      if (isBoss) {
        this.dragonBoss = entity;
      }

      return entity;
    });

    // Start background music
    if (this.currentLevel.config.id % 10 === 0) {
      audio.startMusic('boss');
    } else {
      audio.startMusic('dungeon');
    }

    if (this.onStatsChanged) this.onStatsChanged();
  }

  // Input Handlers
  public handleKeyDown(key: string) {
    const k = key.toLowerCase();
    this.keys[k] = true;

    if (k === 'escape' || k === 'p') {
      this.isPaused = !this.isPaused;
      return;
    }

    if (this.isPaused || this.stats.hp <= 0) return;

    if (k === '1') {
      this.switchWeapon('sword');
    } else if (k === '2') {
      this.switchWeapon('bow');
    } else if (k === '3') {
      this.switchWeapon('staff');
    } else if (k === 'tab') {
      this.cycleWeapon();
    } else if (k === 'r') {
      this.cycleElement();
    } else if (k === 'u' || k === 'f') {
      this.triggerElementSkill();
    } else if (k === ' ' || k === 'j') {
      this.triggerBasicAttack();
    } else if (k === 'k' || k === 'x') {
      this.triggerHeavyAttack();
    } else if (k === 'shift' || k === 'l') {
      this.triggerDash();
    } else if (k === 'e' || k === 'c') {
      this.triggerBlock(true);
      this.triggerInteract();
    } else if (k === 'q') {
      this.usePotion();
    }
  }

  public handleKeyUp(key: string) {
    const k = key.toLowerCase();
    this.keys[k] = false;
    if (k === 'e' || k === 'c') {
      this.triggerBlock(false);
    }
  }

  // --- WEAPON & ELEMENT SWITCHING ---
  public switchWeapon(weapon: WeaponType) {
    if (this.stats.activeWeapon === weapon) return;
    this.stats.activeWeapon = weapon;
    this.pIsBlocking = false;
    audio.playUpgrade();
    const name = weapon === 'sword' ? 'PEDANG KSATRIA 🗡️' : weapon === 'bow' ? 'BUSUR ARCHER 🏹' : 'TONGKAT SIHIR 🪄';
    this.addDamageNumber(this.px, this.py - 25, name, '#38bdf8');
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public cycleWeapon() {
    const cycle: WeaponType[] = ['sword', 'bow', 'staff'];
    const nextIdx = (cycle.indexOf(this.stats.activeWeapon) + 1) % cycle.length;
    this.switchWeapon(cycle[nextIdx]);
  }

  public switchElement(element: ElementType) {
    if (this.stats.activeElement === element) return;
    this.stats.activeElement = element;
    audio.playElementSkill(element);
    const name = element === 'fire' ? 'ELEMEN: API 🔥' : element === 'ice' ? 'ELEMEN: ES ❄️' : 'ELEMEN: PETIR ⚡';
    const col = element === 'fire' ? '#f97316' : element === 'ice' ? '#38bdf8' : '#facc15';
    this.addDamageNumber(this.px, this.py - 25, name, col);
    if (this.onStatsChanged) this.onStatsChanged();
  }

  public cycleElement() {
    const cycle: ElementType[] = ['fire', 'ice', 'lightning'];
    const nextIdx = (cycle.indexOf(this.stats.activeElement) + 1) % cycle.length;
    this.switchElement(cycle[nextIdx]);
  }

  public triggerBasicAttack() {
    if (this.pAttackTimer > 0 || this.pDashTimer > 0) return;
    this.pAttackTimer = 0.28;
    this.pAnimState = 'attack';

    if (this.stats.activeWeapon === 'sword') {
      audio.playSlash(false);
      this.performAttackHitCheck(false);
    } else if (this.stats.activeWeapon === 'bow') {
      audio.playBowShoot();
      this.shootPlayerArrow(false);
    } else if (this.stats.activeWeapon === 'staff') {
      audio.playMagicSpell();
      this.shootPlayerMagicOrb(false);
    }
  }

  public triggerHeavyAttack() {
    if (this.pAttackTimer > 0 || this.pDashTimer > 0) return;
    this.pAttackTimer = 0.48;
    this.pAnimState = 'heavy_attack';

    if (this.stats.activeWeapon === 'sword') {
      audio.playSlash(true);
      this.performAttackHitCheck(true);
    } else if (this.stats.activeWeapon === 'bow') {
      audio.playBowShoot();
      this.shootPlayerArrow(true);
    } else if (this.stats.activeWeapon === 'staff') {
      audio.playMagicSpell();
      this.shootPlayerMagicOrb(true);
    }
  }

  // --- PROJECTILE SHOOTING ---
  private shootPlayerArrow(isHeavy: boolean) {
    const dir = this.pFacingRight ? 1 : -1;
    const speed = isHeavy ? 17 : 14;
    const baseDamage = isHeavy ? Math.round(this.stats.attack * 1.8) : Math.round(this.stats.attack * 1.15);
    const el = this.stats.activeElement;

    this.projectiles.push({
      id: `p_arrow_${Date.now()}_${Math.random()}`,
      x: this.px + dir * 16,
      y: this.py - 12,
      vx: dir * speed,
      vy: 0,
      width: 14,
      height: 4,
      damage: baseDamage,
      fromPlayer: true,
      type: 'arrow',
      life: 2.2,
      element: el,
    });
  }

  private shootPlayerMagicOrb(isHeavy: boolean) {
    const dir = this.pFacingRight ? 1 : -1;
    const speed = isHeavy ? 12 : 9.5;
    const baseDamage = isHeavy ? Math.round(this.stats.attack * 1.9) : Math.round(this.stats.attack * 1.2);
    const el = this.stats.activeElement;
    const orbType = el === 'fire' ? 'hellfire' : el === 'ice' ? 'ice_shard' : 'arcane_orb';

    this.projectiles.push({
      id: `p_orb_${Date.now()}_${Math.random()}`,
      x: this.px + dir * 18,
      y: this.py - 14,
      vx: dir * speed,
      vy: 0,
      width: isHeavy ? 16 : 12,
      height: isHeavy ? 16 : 12,
      damage: baseDamage,
      fromPlayer: true,
      type: orbType,
      life: 2.5,
      element: el,
    });

    if (isHeavy) {
      this.projectiles.push({
        id: `p_orb2_${Date.now()}_${Math.random()}`,
        x: this.px + dir * 18,
        y: this.py - 6,
        vx: dir * (speed * 0.95),
        vy: 1,
        width: 10,
        height: 10,
        damage: Math.round(baseDamage * 0.6),
        fromPlayer: true,
        type: orbType,
        life: 2.5,
        element: el,
      });
    }
  }

  // --- ELEMENTAL SKILL TRIGGER ---
  public triggerElementSkill() {
    if (this.stats.elementSkillCooldown > 0 || this.stats.hp <= 0) return;
    this.stats.elementSkillCooldown = this.stats.maxSkillCooldown;
    this.pAttackTimer = 0.35;
    this.pAnimState = 'heavy_attack';
    this.screenShake = 6;
    audio.playElementSkill(this.stats.activeElement);

    const facingDir = this.pFacingRight ? 1 : -1;
    const el = this.stats.activeElement;
    const wep = this.stats.activeWeapon;
    const baseAtk = this.stats.attack;

    if (wep === 'sword') {
      if (el === 'fire') {
        this.addDamageNumber(this.px, this.py - 30, 'BLAZING FLAMESTRIKE! 🔥', '#f97316', true);
        this.projectiles.push({
          id: `p_flamewave_${Date.now()}`,
          x: this.px + facingDir * 18,
          y: this.py - 12,
          vx: facingDir * 9,
          vy: 0,
          width: 24,
          height: 24,
          damage: Math.round(baseAtk * 2.5),
          fromPlayer: true,
          type: 'flame',
          life: 1.8,
          element: 'fire',
          isPiercing: true,
        });
      } else if (el === 'ice') {
        this.addDamageNumber(this.px, this.py - 30, 'FROSTBLADE WAVE! ❄️', '#38bdf8', true);
        this.projectiles.push({
          id: `p_frostwave_${Date.now()}`,
          x: this.px + facingDir * 18,
          y: this.py - 12,
          vx: facingDir * 10,
          vy: 0,
          width: 20,
          height: 20,
          damage: Math.round(baseAtk * 2.3),
          fromPlayer: true,
          type: 'ice_shard',
          life: 1.8,
          element: 'ice',
          isPiercing: true,
        });
      } else {
        this.addDamageNumber(this.px, this.py - 30, 'THUNDER CLEAVE! ⚡', '#facc15', true);
        this.performThunderCleave(Math.round(baseAtk * 2.7));
      }
    } else if (wep === 'bow') {
      if (el === 'fire') {
        this.addDamageNumber(this.px, this.py - 30, 'HELLFIRE ARROW! 🔥', '#f97316', true);
        this.projectiles.push({
          id: `p_exparrow_${Date.now()}`,
          x: this.px + facingDir * 18,
          y: this.py - 12,
          vx: facingDir * 16,
          vy: 0,
          width: 18,
          height: 8,
          damage: Math.round(baseAtk * 2.6),
          fromPlayer: true,
          type: 'hellfire',
          life: 2.2,
          element: 'fire',
          isExplosive: true,
        });
      } else if (el === 'ice') {
        this.addDamageNumber(this.px, this.py - 30, 'TRIPLE FROST VOLLEY! ❄️', '#38bdf8', true);
        const vys = [-3, 0, 3];
        for (const vy of vys) {
          this.projectiles.push({
            id: `p_frostvolley_${Date.now()}_${vy}`,
            x: this.px + facingDir * 18,
            y: this.py - 12,
            vx: facingDir * 14,
            vy: vy,
            width: 14,
            height: 4,
            damage: Math.round(baseAtk * 1.5),
            fromPlayer: true,
            type: 'ice_shard',
            life: 2.0,
            element: 'ice',
          });
        }
      } else {
        this.addDamageNumber(this.px, this.py - 30, 'STORM PIERCER BOLT! ⚡', '#facc15', true);
        this.projectiles.push({
          id: `p_storm_${Date.now()}`,
          x: this.px + facingDir * 20,
          y: this.py - 12,
          vx: facingDir * 22,
          vy: 0,
          width: 28,
          height: 6,
          damage: Math.round(baseAtk * 2.8),
          fromPlayer: true,
          type: 'lightning_strike',
          life: 1.5,
          element: 'lightning',
          isPiercing: true,
        });
      }
    } else {
      // Staff (Necromancer)
      if (el === 'fire') {
        this.addDamageNumber(this.px, this.py - 30, 'INFERNAL METEOR! 🔥', '#ef4444', true);
        this.projectiles.push({
          id: `p_meteor_${Date.now()}`,
          x: this.px + facingDir * 20,
          y: this.py - 24,
          vx: facingDir * 8,
          vy: 3,
          width: 26,
          height: 26,
          damage: Math.round(baseAtk * 3.0),
          fromPlayer: true,
          type: 'hellfire',
          life: 2.2,
          element: 'fire',
          isExplosive: true,
        });
      } else if (el === 'ice') {
        this.addDamageNumber(this.px, this.py - 30, 'GLACIAL FROST NOVA! ❄️', '#38bdf8', true);
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          this.projectiles.push({
            id: `p_nova_${Date.now()}_${i}`,
            x: this.px + Math.cos(angle) * 12,
            y: this.py - 12 + Math.sin(angle) * 12,
            vx: Math.cos(angle) * 10,
            vy: Math.sin(angle) * 10,
            width: 12,
            height: 12,
            damage: Math.round(baseAtk * 1.8),
            fromPlayer: true,
            type: 'ice_shard',
            life: 1.4,
            element: 'ice',
          });
        }
      } else {
        this.addDamageNumber(this.px, this.py - 30, 'NETHER LIGHTNING! ⚡', '#c084fc', true);
        this.castNetherLightning(Math.round(baseAtk * 2.7));
      }
    }

    if (this.onStatsChanged) this.onStatsChanged();
  }

  private performThunderCleave(damage: number) {
    const reach = 85;
    const hitX = this.px + (this.pFacingRight ? reach / 2 : -reach / 2);
    const hitY = this.py;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.state === 'dead') continue;
      if (Math.hypot(hitX - enemy.x, hitY - enemy.y) < reach) {
        enemy.hp -= damage;
        enemy.hurtTimer = 0.3;
        this.addDamageNumber(enemy.x, enemy.y - 25, `${damage} ⚡ CRIT`, '#fde047', true);
        for (let k = 0; k < 12; k++) {
          this.particles.push({
            x: enemy.x + (Math.random() * 20 - 10),
            y: enemy.y - 12 + (Math.random() * 20 - 10),
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: '#facc15',
            size: 3,
            life: 0.3,
            maxLife: 0.3,
            alpha: 1,
            type: 'spark',
          });
        }
        if (enemy.hp <= 0) {
          this.handleEnemyDeath(enemy);
        }
      }
    }
  }

  private castNetherLightning(damage: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.state === 'dead') continue;
      const dist = Math.hypot(this.px - enemy.x, this.py - enemy.y);
      if (dist < 380) {
        enemy.hp -= damage;
        enemy.hurtTimer = 0.35;
        this.addDamageNumber(enemy.x, enemy.y - 30, `${damage} ⚡ NETHER`, '#c084fc', true);
        for (let y = enemy.y - 120; y <= enemy.y; y += 12) {
          this.particles.push({
            x: enemy.x + (Math.random() * 8 - 4),
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: 1,
            color: '#e879f9',
            size: 4,
            life: 0.35,
            maxLife: 0.35,
            alpha: 1,
            type: 'spark',
          });
        }
        if (enemy.hp <= 0) {
          this.handleEnemyDeath(enemy);
        }
      }
    }
  }

  public triggerDash() {
    if (this.pDashCooldown > 0 || this.pDashTimer > 0) return;
    this.pDashTimer = 0.22;
    this.pDashCooldown = 0.8;
    this.pInvulnerableTimer = 0.25;
    this.pvx = (this.pFacingRight ? 1 : -1) * 11;
    audio.playDash();

    // Dash trail particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.px + (Math.random() * 10 - 5),
        y: this.py + (Math.random() * 20 - 10),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: '#38bdf8',
        size: 3,
        life: 0.25,
        maxLife: 0.25,
        alpha: 0.8,
        type: 'spark',
      });
    }
  }

  public triggerBlock(active: boolean) {
    if (this.stats.activeWeapon === 'bow') {
      // Archer does NOT use a shield! Performs agile dodge roll instead!
      this.pIsBlocking = false;
      if (active) {
        this.triggerDash();
      }
      return;
    }

    if (this.stats.activeWeapon === 'staff') {
      // Necromancer uses Magic Ward Shield!
      this.pIsBlocking = active;
      if (active) {
        audio.playMagicShield();
        // Magic ward particle burst
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          this.particles.push({
            x: this.px + Math.cos(angle) * 20,
            y: this.py - 10 + Math.sin(angle) * 20,
            vx: Math.cos(angle) * 1.5,
            vy: Math.sin(angle) * 1.5,
            color: this.stats.activeElement === 'fire' ? '#f87171' : this.stats.activeElement === 'ice' ? '#7dd3fc' : '#fde047',
            size: 3,
            life: 0.3,
            maxLife: 0.3,
            alpha: 0.9,
            type: 'spark',
          });
        }
      }
      return;
    }

    // Sword: physical shield
    this.pIsBlocking = active;
    if (active) {
      audio.playBlock();
    }
  }

  public triggerInteract() {
    // Check nearby chests
    for (const chest of this.currentLevel.chests) {
      const dist = Math.hypot(this.px - (chest.x + 12), this.py - (chest.y + 12));
      if (dist < 45 && !chest.opened) {
        chest.opened = true;
        audio.playChestOpen();
        this.addDamageNumber(chest.x + 12, chest.y - 10, `+${chest.coins} COINS`, '#facc15');
        this.stats.coins += chest.coins;
        this.levelCoinsEarned += chest.coins;

        if (chest.hasPotion && this.stats.potions < this.stats.maxPotions) {
          this.stats.potions++;
          this.addDamageNumber(chest.x + 12, chest.y - 25, '+1 POTION', '#f87171');
        }

        // Spawn sparkling coin bursts
        for (let i = 0; i < 10; i++) {
          this.particles.push({
            x: chest.x + 12,
            y: chest.y + 6,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 6 - 2,
            color: '#facc15',
            size: 4,
            life: 0.6,
            maxLife: 0.6,
            alpha: 1,
            type: 'gold',
          });
        }
        if (this.onStatsChanged) this.onStatsChanged();
        return;
      }
    }

    // Check Princess rescue in Level 5
    if (this.currentLevel.config.id === 5 && this.currentLevel.princess && !this.princessRescued) {
      const dist = Math.hypot(this.px - this.currentLevel.princess.x, this.py - this.currentLevel.princess.y);
      if (dist < 60) {
        // Can only rescue if dragon is defeated!
        if (this.dragonBoss && this.dragonBoss.hp > 0) {
          this.addDamageNumber(this.currentLevel.princess.x, this.currentLevel.princess.y - 30, 'SLAY DRAKON FIRST!', '#ef4444');
          audio.playBlock();
        } else {
          this.princessRescued = true;
          audio.playVictoryFanfare();
          if (this.onVictory) this.onVictory();
        }
        return;
      }
    }

    // Check Door
    const doorDist = Math.hypot(this.px - (this.currentLevel.door.x + 16), this.py - (this.currentLevel.door.y + 27));
    if (doorDist < 50) {
      if (this.currentLevel.door.locked) {
        this.addDamageNumber(this.currentLevel.door.x + 16, this.currentLevel.door.y - 10, 'LOCKED! DEFEAT ENEMIES', '#ef4444');
        audio.playBlock();
      } else {
        this.finishLevel();
      }
    }
  }

  public usePotion() {
    if (this.stats.potions <= 0 || this.stats.hp >= this.stats.maxHp) return;
    this.stats.potions--;
    const healAmount = 30;
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + healAmount);
    audio.playPotion();
    this.addDamageNumber(this.px, this.py - 20, `+${healAmount} HP`, '#4ade80');

    // Green heal sparkles
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: this.px + (Math.random() * 20 - 10),
        y: this.py + (Math.random() * 20 - 10),
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        color: '#4ade80',
        size: 3,
        life: 0.5,
        maxLife: 0.5,
        alpha: 1,
        type: 'heart',
      });
    }
    if (this.onStatsChanged) this.onStatsChanged();
  }

  private performAttackHitCheck(isHeavy: boolean) {
    const reach = isHeavy ? 65 : 48;
    const hitX = this.px + (this.pFacingRight ? reach / 2 : -reach / 2);
    const hitY = this.py;

    // Check hit on enemies
    let hitAny = false;
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;

      const ex = enemy.x;
      const ey = enemy.y;
      const dist = Math.hypot(hitX - ex, hitY - ey);

      if (dist < reach + enemy.width / 2) {
        hitAny = true;
        const multiplier = isHeavy ? 1.8 : 1.0;
        const rawDmg = Math.round(this.stats.attack * multiplier);
        const actualDmg = Math.max(1, rawDmg - Math.floor(enemy.defense * 0.4));
        const isCrit = isHeavy || Math.random() < 0.2;
        const finalDmg = isCrit ? Math.round(actualDmg * 1.3) : actualDmg;

        enemy.hp -= finalDmg;
        enemy.hurtTimer = 0.25;

        // Knockback
        const dir = this.pFacingRight ? 1 : -1;
        enemy.vx = dir * (isHeavy ? 6 : 3);
        if (enemy.type !== 'dragon') {
          enemy.vy = -3;
        }

        audio.playHit(isCrit);
        audio.playEnemyHurt();

        if (isHeavy) {
          this.screenShake = 6;
        }

        this.addDamageNumber(enemy.x, enemy.y - 20, `${finalDmg}`, isCrit ? '#f87171' : '#facc15', isCrit);

        // Hit spark particles
        for (let i = 0; i < (isHeavy ? 10 : 5); i++) {
          this.particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: '#fde047',
            size: 3,
            life: 0.3,
            maxLife: 0.3,
            alpha: 1,
            type: 'spark',
          });
        }

        // Enemy death check
        if (enemy.hp <= 0) {
          this.handleEnemyDeath(enemy);
        }
      }
    }

    if (!hitAny) {
      // Small air slash particles
      this.particles.push({
        x: hitX,
        y: hitY,
        vx: (this.pFacingRight ? 1 : -1) * 3,
        vy: 0,
        color: '#e2e8f0',
        size: 4,
        life: 0.15,
        maxLife: 0.15,
        alpha: 0.6,
        type: 'spark',
      });
    }
  }

  public handleEnemyDeath(enemy: EnemyEntity, isFallen: boolean = false) {
    if (enemy.state === 'dead') return;
    enemy.state = 'dead';
    audio.playEnemyDeath();
    this.levelEnemiesKilled++;

    // Reward coins based on enemy type
    let coinVal = 5;
    switch (enemy.type) {
      case 'archer':
        coinVal = 8;
        break;
      case 'elite':
        coinVal = 20;
        break;
      case 'dragon':
        coinVal = 600;
        break;
      case 'apprentice_mage':
        coinVal = 15;
        break;
      case 'pyro_sorcerer':
        coinVal = 24;
        break;
      case 'frost_necromancer':
        coinVal = 30;
        break;
      case 'wizard_boss':
        coinVal = 1000;
        break;
      case 'nether_imp':
        coinVal = 20;
        break;
      case 'demon_hound':
        coinVal = 28;
        break;
      case 'hell_knight':
        coinVal = 50;
        break;
      case 'lucifer':
        coinVal = 2500;
        break;
      default:
        coinVal = 6;
        break;
    }

    const isBoss = enemy.type === 'dragon' || enemy.type === 'wizard_boss' || enemy.type === 'lucifer';

    if (isFallen) {
      // Enemy fell out of bounds / in hazard: reward player directly so coins aren't lost
      this.stats.coins += coinVal;
      this.levelCoinsEarned += coinVal;
      this.addDamageNumber(this.px, this.py - 30, `MUSUH JATUH! +${coinVal}🪙`, '#38bdf8');
    } else {
      // Drop physical bouncing coins
      const count = isBoss ? 24 : Math.min(8, Math.ceil(coinVal / 4));
      const valuePerCoin = Math.max(1, Math.floor(coinVal / count));

      for (let i = 0; i < count; i++) {
        this.coinDrops.push({
          id: `coin_${Date.now()}_${Math.random()}`,
          x: enemy.x + (Math.random() * 20 - 10),
          y: enemy.y + (Math.random() * 20 - 10),
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 5 - 2,
          value: valuePerCoin,
          collected: false,
          life: 15,
        });
      }
    }

    // Death explosion particles
    const particleColor =
      enemy.type === 'dragon' || enemy.type === 'lucifer'
        ? '#ef4444'
        : enemy.type === 'wizard_boss' || enemy.type === 'apprentice_mage'
        ? '#c084fc'
        : enemy.type === 'pyro_sorcerer'
        ? '#f97316'
        : enemy.type === 'frost_necromancer'
        ? '#38bdf8'
        : enemy.type === 'nether_imp' || enemy.type === 'demon_hound' || enemy.type === 'hell_knight'
        ? '#dc2626'
        : '#22c55e';

    for (let i = 0; i < (isBoss ? 45 : 16); i++) {
      this.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: (Math.random() - 0.5) * 9,
        vy: (Math.random() - 0.5) * 9,
        color: particleColor,
        size: isBoss ? 6 : 4,
        life: 0.7,
        maxLife: 0.7,
        alpha: 1,
        type: 'blood',
      });
    }

    if (isBoss) {
      this.screenShake = 18;
      audio.playDragonRoar();
      const bossTitle =
        enemy.type === 'lucifer'
          ? 'LUCIFER BANISHED!'
          : enemy.type === 'wizard_boss'
          ? 'ARCHMAGE MORVATH DEFEATED!'
          : 'DRAKON SLAIN!';
      this.addDamageNumber(enemy.x, enemy.y - 45, bossTitle, '#facc15', true);
    }

    // Check if all enemies are dead or boss is defeated to unlock door
    const livingEnemies = this.enemies.filter((e) => e.state !== 'dead').length;
    if (livingEnemies === 0 || (isBoss && enemy.state === 'dead')) {
      this.currentLevel.door.locked = false;
      this.addDamageNumber(
        this.currentLevel.door.x + 16,
        this.currentLevel.door.y - 20,
        'PINTU TERBUKA!',
        '#38bdf8',
        true
      );
      audio.playChestOpen();
    }

    if (this.onStatsChanged) this.onStatsChanged();
  }

  public finishLevel() {
    this.isRunning = false;
    audio.stopMusic();
    audio.playVictoryFanfare();

    const timeElapsed = Math.floor((Date.now() - this.levelStartTime) / 1000);
    const clearBonus = this.currentLevel.config.rewardBase;
    this.stats.coins += clearBonus;
    this.levelCoinsEarned += clearBonus;

    const stats: LevelStats = {
      coinsEarned: this.levelCoinsEarned,
      enemiesDefeated: this.levelEnemiesKilled,
      timeSeconds: timeElapsed,
      bonus: clearBonus,
    };

    if (this.onLevelComplete) {
      this.onLevelComplete(stats);
    }
  }

  // --- MAIN TICK / UPDATE LOOP ---
  public update(dt: number) {
    if (this.isPaused || !this.isRunning) return;

    this.pAnimFrame += dt;

    // Timers
    if (this.pHurtTimer > 0) this.pHurtTimer -= dt;
    if (this.pAttackTimer > 0) this.pAttackTimer -= dt;
    if (this.pDashTimer > 0) this.pDashTimer -= dt;
    if (this.pDashCooldown > 0) this.pDashCooldown -= dt;
    if (this.pInvulnerableTimer > 0) this.pInvulnerableTimer -= dt;
    if (this.stats.elementSkillCooldown > 0) {
      this.stats.elementSkillCooldown = Math.max(0, this.stats.elementSkillCooldown - dt);
    }
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 15);
    }

    // Moving platforms update
    for (const p of this.currentLevel.platforms) {
      if (p.type === 'moving' && p.moveAxis && p.moveRange && p.moveSpeed) {
        const t = (Date.now() / 1000) * p.moveSpeed;
        const offset = Math.sin(t) * p.moveRange;
        if (p.moveAxis === 'x') {
          p.x = (p.initialX || 0) + offset;
        } else {
          p.y = (p.initialY || 0) + offset;
        }
      }
    }

    // --- PLAYER MOVEMENT & PHYSICS ---
    if (this.pDashTimer <= 0 && this.stats.hp > 0) {
      let moveDir = 0;
      if (this.keys['a'] || this.keys['arrowleft']) moveDir -= 1;
      if (this.keys['d'] || this.keys['arrowright']) moveDir += 1;

      // Speed is reduced if blocking
      const currentSpeed = this.pIsBlocking ? this.stats.speed * 0.4 : this.stats.speed;
      this.pvx = moveDir * currentSpeed;

      if (moveDir !== 0) {
        this.pFacingRight = moveDir > 0;
      }

      // Jump
      const jumpKey = this.keys['w'] || this.keys['arrowup'];
      if (jumpKey && this.pGrounded && !this.pIsBlocking) {
        this.pvy = -9.5;
        this.pGrounded = false;
        audio.playJump();
      }

      // Gravity
      this.pvy += 22 * dt;
      if (this.pvy > 14) this.pvy = 14;

      // Anim state
      if (this.pAttackTimer > 0) {
        // Keep attack anim
      } else if (this.pIsBlocking) {
        this.pAnimState = 'block';
      } else if (!this.pGrounded) {
        this.pAnimState = 'jump';
      } else if (Math.abs(this.pvx) > 0.5) {
        this.pAnimState = 'walk';
      } else {
        this.pAnimState = 'idle';
      }
    } else if (this.pDashTimer > 0) {
      // Dashing, no gravity
      this.pvy = 0;
    }

    // Horizontal Move & Collision
    this.px += this.pvx;
    if (this.px < 20) this.px = 20;
    if (this.px > this.currentLevel.config.width - 20) {
      this.px = this.currentLevel.config.width - 20;
    }

    // Vertical Move & Platform Collision
    this.py += this.pvy;
    this.pGrounded = false;

    // Check platform collisions
    const pBox = {
      x: this.px - 10,
      y: this.py - 24,
      w: 20,
      h: 36,
    };

    for (const plat of this.currentLevel.platforms) {
      // Stand on platform
      if (
        this.pvy >= 0 &&
        this.px + 8 > plat.x &&
        this.px - 8 < plat.x + plat.width &&
        this.py >= plat.y &&
        this.py - this.pvy <= plat.y + 12
      ) {
        this.py = plat.y;
        this.pvy = 0;
        this.pGrounded = true;
      }
    }

    // Fall in pit death boundary
    if (this.py > this.currentLevel.config.height + 60) {
      this.takePlayerDamage(50);
      // Respawn at safe start platform
      this.px = this.currentLevel.config.playerStartX;
      this.py = this.currentLevel.config.playerStartY;
      this.pvx = 0;
      this.pvy = 0;
    }

    // Check Trap collisions (spikes / lava)
    for (const trap of this.currentLevel.traps) {
      if (
        this.px > trap.x &&
        this.px < trap.x + trap.width &&
        this.py > trap.y &&
        this.py < trap.y + trap.height + 10
      ) {
        this.takePlayerDamage(trap.damage);
        this.pvy = -6; // Bounce away
      }
    }

    // --- UPDATE ENEMIES ---
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;

      // CRITICAL FIX: If enemy falls out of the map boundary, it dies and unlocks door!
      if (enemy.y > this.currentLevel.config.height + 25) {
        this.handleEnemyDeath(enemy, true);
        continue;
      }

      enemy.animFrame += dt;
      if (enemy.hurtTimer > 0) enemy.hurtTimer -= dt;
      if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;

      if (enemy.type === 'dragon') {
        this.updateDragonBoss(enemy, dt);
      } else if (enemy.type === 'wizard_boss') {
        EnemyAI.updateWizardBoss(this, enemy, dt);
      } else if (enemy.type === 'lucifer') {
        EnemyAI.updateLuciferBoss(this, enemy, dt);
      } else if (
        enemy.type === 'apprentice_mage' ||
        enemy.type === 'pyro_sorcerer' ||
        enemy.type === 'frost_necromancer'
      ) {
        EnemyAI.updateWizard(this, enemy, dt);
      } else if (
        enemy.type === 'nether_imp' ||
        enemy.type === 'demon_hound' ||
        enemy.type === 'hell_knight'
      ) {
        EnemyAI.updateDemon(this, enemy, dt);
      } else {
        EnemyAI.updateGoblin(this, enemy, dt);
      }
    }

    // Door Unlock Failsafe: If no living enemies remain and door is locked, open it!
    const livingRemaining = this.enemies.filter((e) => e.state !== 'dead').length;
    if (livingRemaining === 0 && this.currentLevel.door.locked) {
      this.currentLevel.door.locked = false;
      this.addDamageNumber(
        this.currentLevel.door.x + 16,
        this.currentLevel.door.y - 20,
        'PINTU TERBUKA!',
        '#38bdf8',
        true
      );
    }

    // --- UPDATE PROJECTILES ---
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;

      // Trail particles
      if (p.type === 'fireball' || p.type === 'flame') {
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          color: '#f97316',
          size: 3,
          life: 0.2,
          maxLife: 0.2,
          alpha: 0.8,
          type: 'fire',
        });
      }

      // Check hit against player
      if (!p.fromPlayer) {
        const pDist = Math.hypot(p.x - this.px, p.y - (this.py - 12));
        if (pDist < 20) {
          this.takePlayerDamage(p.damage);
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Check hit against enemies
        let hitEnemy = false;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (enemy.state === 'dead') continue;
          const eDist = Math.hypot(p.x - enemy.x, p.y - (enemy.y - enemy.height / 2));
          if (eDist < Math.max(20, enemy.width / 2 + 10)) {
            hitEnemy = true;
            const actualDamage = Math.max(1, p.damage - Math.floor(enemy.defense / 2));
            enemy.hp -= actualDamage;
            enemy.hurtTimer = 0.25;
            this.screenShake = 3;

            // Element special effect on hit
            if (p.element === 'fire' || p.type === 'flame' || p.type === 'hellfire') {
              this.addDamageNumber(enemy.x, enemy.y - enemy.height - 10, `${actualDamage} 🔥`, '#f97316');
              for (let k = 0; k < 6; k++) {
                this.particles.push({
                  x: enemy.x + (Math.random() * 16 - 8),
                  y: enemy.y - 12 + (Math.random() * 16 - 8),
                  vx: (Math.random() - 0.5) * 4,
                  vy: -Math.random() * 3,
                  color: '#ef4444',
                  size: 3,
                  life: 0.25,
                  maxLife: 0.25,
                  alpha: 1,
                  type: 'fire',
                });
              }
            } else if (p.element === 'ice' || p.type === 'ice_shard') {
              this.addDamageNumber(enemy.x, enemy.y - enemy.height - 10, `${actualDamage} ❄️`, '#38bdf8');
              enemy.vx *= 0.25; // Slow enemy
              for (let k = 0; k < 6; k++) {
                this.particles.push({
                  x: enemy.x + (Math.random() * 16 - 8),
                  y: enemy.y - 12 + (Math.random() * 16 - 8),
                  vx: (Math.random() - 0.5) * 3,
                  vy: -Math.random() * 2,
                  color: '#7dd3fc',
                  size: 3,
                  life: 0.25,
                  maxLife: 0.25,
                  alpha: 1,
                  type: 'spark',
                });
              }
            } else {
              // Lightning or default
              this.addDamageNumber(enemy.x, enemy.y - enemy.height - 10, `${actualDamage} ⚡`, '#facc15');
              for (let k = 0; k < 6; k++) {
                this.particles.push({
                  x: enemy.x + (Math.random() * 16 - 8),
                  y: enemy.y - 12 + (Math.random() * 16 - 8),
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: '#fde047',
                  size: 2,
                  life: 0.2,
                  maxLife: 0.2,
                  alpha: 1,
                  type: 'spark',
                });
              }
            }

            audio.playHit();

            // Area explosion effect
            if (p.isExplosive) {
              this.screenShake = 8;
              for (const nearby of this.enemies) {
                if (nearby.id !== enemy.id && nearby.state !== 'dead') {
                  const splashDist = Math.hypot(p.x - nearby.x, p.y - nearby.y);
                  if (splashDist < 75) {
                    const splashDmg = Math.round(actualDamage * 0.75);
                    nearby.hp -= splashDmg;
                    nearby.hurtTimer = 0.25;
                    this.addDamageNumber(nearby.x, nearby.y - 20, `${splashDmg} 💥`, '#ef4444');
                    if (nearby.hp <= 0) {
                      this.handleEnemyDeath(nearby);
                    }
                  }
                }
              }
            }

            if (enemy.hp <= 0) {
              this.handleEnemyDeath(enemy);
            }

            if (!p.isPiercing) {
              break;
            }
          }
        }

        if (hitEnemy && !p.isPiercing) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Check out of bounds or expired
      if (
        p.life <= 0 ||
        p.x < 0 ||
        p.x > this.currentLevel.config.width ||
        p.y > this.currentLevel.config.height
      ) {
        this.projectiles.splice(i, 1);
      }
    }

    // --- UPDATE COIN DROPS ---
    for (const coin of this.coinDrops) {
      if (coin.collected) continue;
      coin.vy += 15 * dt;
      coin.x += coin.vx;
      coin.y += coin.vy;
      coin.vx *= 0.98;
      coin.life -= dt;

      // Platform bounce
      for (const plat of this.currentLevel.platforms) {
        if (
          coin.x > plat.x &&
          coin.x < plat.x + plat.width &&
          coin.y >= plat.y &&
          coin.y <= plat.y + 12
        ) {
          coin.y = plat.y;
          coin.vy = -coin.vy * 0.4;
        }
      }

      // Magnetic pull to player
      const distToPlayer = Math.hypot(this.px - coin.x, (this.py - 12) - coin.y);
      if (distToPlayer < 75) {
        coin.x += (this.px - coin.x) * 0.18;
        coin.y += ((this.py - 12) - coin.y) * 0.18;
      }

      if (distToPlayer < 24) {
        coin.collected = true;
        this.stats.coins += coin.value;
        this.levelCoinsEarned += coin.value;
        audio.playCoin();
        this.addDamageNumber(coin.x, coin.y - 12, `+${coin.value}`, '#facc15');
        if (this.onStatsChanged) this.onStatsChanged();
      }
    }
    this.coinDrops = this.coinDrops.filter((c) => !c.collected && c.life > 0);

    // --- UPDATE PARTICLES ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.life -= dt;
      part.alpha = Math.max(0, part.life / part.maxLife);
      if (part.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // --- UPDATE DAMAGE NUMBERS ---
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.y += dn.vy * dt;
      dn.alpha -= dt * 1.3;
      if (dn.alpha <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }

    // --- UPDATE CAMERA ---
    const targetCamX = this.px - this.canvas.width / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraX = Math.max(0, Math.min(this.currentLevel.config.width - this.canvas.width, this.cameraX));

    // Vertical Camera Follow: keep player centered with clear view of ground & surroundings
    let targetCamY = 0;
    if (this.canvas.height < this.currentLevel.config.height) {
      targetCamY = this.py - this.canvas.height * 0.55;
      const maxCamY = Math.max(0, this.currentLevel.config.height - this.canvas.height + 20);
      targetCamY = Math.max(0, Math.min(maxCamY, targetCamY));
    } else {
      targetCamY = -(this.canvas.height - this.currentLevel.config.height) / 2;
    }
    this.cameraY += (targetCamY - this.cameraY) * 0.1;
  }

  // --- GOBLIN AI ---
  private updateGoblin(enemy: EnemyEntity, dt: number) {
    const distToPlayer = Math.hypot(this.px - enemy.x, this.py - enemy.y);
    const inPatrolBounds = enemy.x >= enemy.patrolMinX && enemy.x <= enemy.patrolMaxX;

    // Apply gravity
    enemy.vy += 22 * dt;
    enemy.y += enemy.vy;

    // Platform collision
    for (const plat of this.currentLevel.platforms) {
      if (
        enemy.vy >= 0 &&
        enemy.x > plat.x - 10 &&
        enemy.x < plat.x + plat.width + 10 &&
        enemy.y >= plat.y &&
        enemy.y - enemy.vy <= plat.y + 12
      ) {
        enemy.y = plat.y;
        enemy.vy = 0;
      }
    }

    if (distToPlayer < (enemy.type === 'archer' ? 320 : 200)) {
      // Aggro / Chase
      enemy.facingRight = this.px > enemy.x;

      if (enemy.type === 'archer') {
        // Archer behavior: keep distance & shoot
        if (distToPlayer < 80) {
          // Back away
          enemy.x += (enemy.facingRight ? -1 : 1) * enemy.speed;
        } else if (distToPlayer > 260) {
          enemy.x += (enemy.facingRight ? 1 : -1) * enemy.speed;
        }

        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 2.0;
          this.shootArrow(enemy.x, enemy.y - 12, enemy.facingRight, enemy.attack);
        }
      } else {
        // Melee Warrior / Elite
        const attackRange = enemy.type === 'elite' ? 44 : 32;
        if (distToPlayer > attackRange) {
          // Move towards player
          enemy.x += (enemy.facingRight ? 1 : -1) * enemy.speed;
        } else if (enemy.attackCooldown <= 0) {
          // Strike
          enemy.attackCooldown = enemy.type === 'elite' ? 1.6 : 1.1;
          this.takePlayerDamage(enemy.attack);
          audio.playSlash(enemy.type === 'elite');
        }
      }
    } else {
      // Patrol back and forth
      if (enemy.x <= enemy.patrolMinX) enemy.facingRight = true;
      if (enemy.x >= enemy.patrolMaxX) enemy.facingRight = false;
      enemy.x += (enemy.facingRight ? 1 : -1) * (enemy.speed * 0.5);
    }
  }

  // --- DRAGON DRAKON BOSS AI ---
  private updateDragonBoss(boss: EnemyEntity, dt: number) {
    const hpRatio = boss.hp / boss.maxHp;
    if (hpRatio <= 0.3) {
      boss.dragonPhase = 3;
    } else if (hpRatio <= 0.6) {
      boss.dragonPhase = 2;
    } else {
      boss.dragonPhase = 1;
    }

    boss.facingRight = this.px > boss.x;
    boss.specialTimer = (boss.specialTimer || 0) + dt;

    const distToPlayer = Math.hypot(this.px - boss.x, this.py - boss.y);

    // Phase 1: Claw & Bite
    if (boss.dragonPhase === 1) {
      boss.attackMode = distToPlayer < 90 ? 'claw' : 'bite';
      // Slow stalk toward player
      boss.x += (boss.facingRight ? 1 : -1) * (boss.speed * 0.6);

      if (boss.attackCooldown <= 0 && distToPlayer < 110) {
        boss.attackCooldown = 1.6;
        this.takePlayerDamage(boss.attack);
        audio.playDragonRoar();
        this.screenShake = 8;
      }
    }
    // Phase 2: Fire Breath & Fireballs & Flying
    else if (boss.dragonPhase === 2) {
      if (boss.specialTimer && boss.specialTimer > 6) {
        boss.specialTimer = 0;
        // Take flight or fire breath
        boss.attackMode = boss.attackMode === 'flying' ? 'fire_breath' : 'flying';
      }

      if (boss.attackMode === 'flying') {
        boss.y += ((boss.flightY || 240) - boss.y) * 0.05;
        boss.x += (boss.facingRight ? 1 : -1) * (boss.speed * 1.2);
        // Rain down fireballs
        if (boss.attackCooldown <= 0) {
          boss.attackCooldown = 1.4;
          this.shootFireball(boss.x, boss.y, boss.facingRight, 25);
        }
      } else {
        // Ground stance
        boss.y += (460 - boss.y) * 0.1;
        if (boss.attackCooldown <= 0) {
          boss.attackCooldown = 2.0;
          this.shootFireball(boss.x + (boss.facingRight ? 40 : -40), boss.y - 20, boss.facingRight, 25);
        }
      }
    }
    // Phase 3: Enraged, Fire Rain & Berserk Rush
    else if (boss.dragonPhase === 3) {
      boss.y += (460 - boss.y) * 0.1;
      boss.x += (boss.facingRight ? 1 : -1) * (boss.speed * 1.5);

      // Fire rain meteor attacks
      if (boss.specialTimer && boss.specialTimer > 3.0) {
        boss.specialTimer = 0;
        audio.playFireball();
        this.screenShake = 10;
        // Spawn falling meteors around player
        for (let i = -1; i <= 1; i++) {
          this.projectiles.push({
            id: `meteor_${Date.now()}_${i}`,
            x: this.px + i * 90 + (Math.random() * 30 - 15),
            y: 40,
            vx: 0,
            vy: 7,
            width: 14,
            height: 14,
            damage: 28,
            fromPlayer: false,
            type: 'fireball',
            life: 3,
          });
        }
      }

      if (boss.attackCooldown <= 0 && distToPlayer < 120) {
        boss.attackCooldown = 1.0;
        this.takePlayerDamage(boss.attack);
        audio.playDragonRoar();
      }
    }
  }

  public shootArrow(x: number, y: number, facingRight: boolean, damage: number) {
    this.projectiles.push({
      id: `arrow_${Date.now()}_${Math.random()}`,
      x: x,
      y: y,
      vx: (facingRight ? 1 : -1) * 6.5,
      vy: -0.8,
      width: 12,
      height: 4,
      damage: damage,
      fromPlayer: false,
      type: 'arrow',
      life: 3,
    });
  }

  public shootFireball(x: number, y: number, facingRight: boolean, damage: number) {
    audio.playFireball();
    this.projectiles.push({
      id: `fireball_${Date.now()}_${Math.random()}`,
      x: x,
      y: y,
      vx: (facingRight ? 1 : -1) * 7.0,
      vy: 0.5,
      width: 16,
      height: 16,
      damage: damage,
      fromPlayer: false,
      type: 'fireball',
      life: 3,
    });
  }

  public shootArcaneOrb(x: number, y: number, targetX: number, targetY: number, damage: number) {
    audio.playFireball();
    const angle = Math.atan2(targetY - y, targetX - x);
    const speed = 5.5;
    this.projectiles.push({
      id: `arcane_${Date.now()}_${Math.random()}`,
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: 14,
      height: 14,
      damage: damage,
      fromPlayer: false,
      type: 'arcane_orb',
      life: 3.5,
    });
  }

  public shootIceShard(x: number, y: number, facingRight: boolean, damage: number) {
    this.projectiles.push({
      id: `ice_${Date.now()}_${Math.random()}`,
      x: x,
      y: y,
      vx: (facingRight ? 1 : -1) * 6.0,
      vy: 0,
      width: 18,
      height: 8,
      damage: damage,
      fromPlayer: false,
      type: 'ice_shard',
      life: 3,
    });
  }

  public shootHellfire(x: number, y: number, facingRight: boolean, damage: number) {
    audio.playFireball();
    this.projectiles.push({
      id: `hellfire_${Date.now()}_${Math.random()}`,
      x: x,
      y: y,
      vx: (facingRight ? 1 : -1) * 7.5,
      vy: 0.2,
      width: 18,
      height: 18,
      damage: damage,
      fromPlayer: false,
      type: 'hellfire',
      life: 3,
    });
  }

  public shootDarkScythe(x: number, y: number, facingRight: boolean, damage: number) {
    this.projectiles.push({
      id: `scythe_${Date.now()}_${Math.random()}`,
      x: x,
      y: y,
      vx: (facingRight ? 1 : -1) * 8.0,
      vy: 0,
      width: 24,
      height: 24,
      damage: damage,
      fromPlayer: false,
      type: 'dark_scythe',
      life: 3,
    });
  }

  public takePlayerDamage(rawDamage: number) {
    if (this.pInvulnerableTimer > 0 || this.stats.hp <= 0) return;

    let damage = Math.max(1, rawDamage - Math.floor(this.stats.defense * 0.4));

    // Shield blocking reduction
    if (this.pIsBlocking) {
      if (this.stats.activeWeapon === 'staff') {
        // Necromancer: Tameng ilmu sihir menyerap 85%-96% damage!
        const magicBlockPercent = Math.min(0.96, 0.82 + (this.upgrades.shield * 0.02));
        damage = Math.max(1, Math.round(damage * (1 - magicBlockPercent)));
        audio.playMagicShield();
        this.addDamageNumber(this.px, this.py - 24, `PERISAI SIHIR! -${damage}`, '#c084fc');
        for (let i = 0; i < 8; i++) {
          this.particles.push({
            x: this.px + (Math.random() * 20 - 10),
            y: this.py - 12 + (Math.random() * 20 - 10),
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#c084fc',
            size: 3,
            life: 0.3,
            maxLife: 0.3,
            alpha: 1,
            type: 'spark',
          });
        }
      } else {
        damage = Math.max(1, Math.round(damage * (1 - this.stats.blockPercent)));
        audio.playBlock();
        this.addDamageNumber(this.px, this.py - 24, `BLOCKED! -${damage}`, '#38bdf8');
      }
    } else {
      audio.playPlayerHurt();
      this.addDamageNumber(this.px, this.py - 24, `-${damage}`, '#ef4444');
    }

    this.stats.hp = Math.max(0, this.stats.hp - damage);
    this.pHurtTimer = 0.35;
    this.pInvulnerableTimer = 0.6;
    this.screenShake = 5;

    // Blood particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.px,
        y: this.py - 12,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4,
        color: '#dc2626',
        size: 3,
        life: 0.4,
        maxLife: 0.4,
        alpha: 1,
        type: 'blood',
      });
    }

    if (this.stats.hp <= 0) {
      this.handlePlayerDeath();
    }

    if (this.onStatsChanged) this.onStatsChanged();
  }

  private handlePlayerDeath() {
    this.isRunning = false;
    audio.stopMusic();
    audio.playPlayerDeath();
    this.pAnimState = 'hurt';

    if (this.onGameOver) {
      this.onGameOver({
        enemiesDefeated: this.levelEnemiesKilled,
        coinsCollected: this.levelCoinsEarned,
      });
    }
  }

  public addDamageNumber(x: number, y: number, text: string, color: string, isCrit: boolean = false) {
    this.damageNumbers.push({
      x: x,
      y: y,
      vy: -28,
      text: text,
      color: color,
      alpha: 1,
      isCrit: isCrit,
    });
  }

  // --- RENDER FUNCTION ---
  public render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear background with dungeon atmosphere
    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Sky / Back wall gradient based on world theme
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    const lvlId = this.currentLevel.config.id;
    if (lvlId > 20) {
      // World 3: Abyssal Inferno
      bgGrad.addColorStop(0, '#120303');
      bgGrad.addColorStop(1, '#330808');
    } else if (lvlId > 10) {
      // World 2: Astral Sanctum
      bgGrad.addColorStop(0, '#09081a');
      bgGrad.addColorStop(1, '#1b1238');
    } else if (this.currentLevel.config.theme === 'dragons_lair' || this.currentLevel.config.theme === 'dragons_castle') {
      bgGrad.addColorStop(0, '#1c0b0b');
      bgGrad.addColorStop(1, '#3b0d0d');
    } else if (this.currentLevel.config.theme === 'goblin_cave') {
      bgGrad.addColorStop(0, '#0a0d14');
      bgGrad.addColorStop(1, '#111827');
    } else {
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Parallax background stone pillars
    ctx.save();
    ctx.translate(-this.cameraX * 0.3, -this.cameraY * 0.15);
    const pillarColor = lvlId > 20 ? 'rgba(40, 10, 10, 0.45)' : lvlId > 10 ? 'rgba(25, 20, 50, 0.45)' : 'rgba(15, 23, 42, 0.4)';
    ctx.fillStyle = pillarColor;
    for (let px = 60; px < this.currentLevel.config.width; px += 260) {
      ctx.fillRect(px, 20, 48, Math.max(h + 200, this.currentLevel.config.height + 200));
      ctx.fillRect(px - 10, 20, 68, 16); // Capital
    }
    ctx.restore();

    // Camera Translation for World Entities
    ctx.save();
    ctx.translate(-Math.round(this.cameraX), -Math.round(this.cameraY));

    const nowSec = Date.now() / 1000;

    // Draw Torches
    for (const t of this.currentLevel.torches) {
      PixelRenderer.drawTorch(ctx, t.x, t.y, nowSec);
    }

    // Draw Door / Portal
    PixelRenderer.drawDoor(ctx, this.currentLevel.door, nowSec);

    // Draw Traps (Spikes, Lava)
    for (const trap of this.currentLevel.traps) {
      PixelRenderer.drawTrap(ctx, trap);
    }

    // Draw Platforms
    for (const plat of this.currentLevel.platforms) {
      PixelRenderer.drawPlatform(ctx, plat.x, plat.y, plat.width, plat.height, plat.type);
    }

    // Draw Chests
    for (const chest of this.currentLevel.chests) {
      PixelRenderer.drawChest(ctx, chest);
    }

    // Draw Princess Lyra if present on level
    if (this.currentLevel.princess) {
      PixelRenderer.drawPrincess(
        ctx,
        this.currentLevel.princess.x,
        this.currentLevel.princess.y,
        this.princessRescued,
        nowSec
      );
    }

    // Draw Coin Drops
    for (const coin of this.coinDrops) {
      PixelRenderer.drawCoin(ctx, coin.x, coin.y, nowSec);
    }

    // Draw Enemies (All 12 types across 3 worlds)
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;

      if (enemy.type === 'dragon') {
        const mode = enemy.attackMode === 'cleave' ? 'claw' : (enemy.attackMode || 'idle');
        PixelRenderer.drawDragon(
          ctx,
          enemy.x,
          enemy.y,
          enemy.facingRight,
          enemy.animFrame,
          enemy.dragonPhase || 1,
          mode,
          enemy.hurtTimer
        );
      } else if (enemy.type === 'wizard_boss') {
        EnemyRenderer.drawWizardBoss(
          ctx,
          enemy.x,
          enemy.y,
          enemy,
          enemy.facingRight,
          enemy.animFrame,
          enemy.hurtTimer
        );
      } else if (enemy.type === 'lucifer') {
        EnemyRenderer.drawLucifer(
          ctx,
          enemy.x,
          enemy.y,
          enemy,
          enemy.facingRight,
          enemy.animFrame,
          enemy.hurtTimer
        );
      } else if (
        enemy.type === 'apprentice_mage' ||
        enemy.type === 'pyro_sorcerer' ||
        enemy.type === 'frost_necromancer'
      ) {
        EnemyRenderer.drawWizard(
          ctx,
          enemy.x,
          enemy.y,
          enemy.type,
          enemy.facingRight,
          enemy.animFrame,
          enemy.attackCooldown > 0.8,
          enemy.hurtTimer
        );
      } else if (
        enemy.type === 'nether_imp' ||
        enemy.type === 'demon_hound' ||
        enemy.type === 'hell_knight'
      ) {
        EnemyRenderer.drawDemon(
          ctx,
          enemy.x,
          enemy.y,
          enemy.type,
          enemy.facingRight,
          enemy.animFrame,
          enemy.attackCooldown > 0.8,
          enemy.hurtTimer
        );
      } else {
        PixelRenderer.drawGoblin(
          ctx,
          enemy.x,
          enemy.y,
          enemy.type,
          enemy.facingRight,
          enemy.animFrame,
          enemy.attackCooldown > 0.8,
          enemy.hurtTimer
        );
      }

      // Draw Enemy Health Bar (for non-bosses)
      const isBoss = enemy.type === 'dragon' || enemy.type === 'wizard_boss' || enemy.type === 'lucifer';
      if (!isBoss && enemy.hp < enemy.maxHp) {
        const barW = 28;
        const barH = 4;
        const barX = enemy.x - barW / 2;
        const barY = enemy.y - enemy.height - 8;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        ctx.fillStyle = '#ef4444';
        const fillW = Math.max(0, (enemy.hp / enemy.maxHp) * barW);
        ctx.fillRect(barX, barY, fillW, barH);
      }
    }

    // Draw Projectiles
    for (const p of this.projectiles) {
      ctx.save();
      if (p.type === 'arrow') {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(p.x - 2, p.y - 1, 4, 6);
      } else if (p.type === 'fireball') {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'arcane_orb') {
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f5d0fe';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ice_shard') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.x - 8, p.y - 3, 16, 6);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(p.x - 4, p.y - 1, 8, 2);
      } else if (p.type === 'hellfire') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'flame') {
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'lightning_strike') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(p.x - p.width / 2, p.y - 3, p.width, 6);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.x - p.width / 2 + 2, p.y - 1, p.width - 4, 2);
      } else if (p.type === 'dark_scythe') {
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(p.x - 2, p.y, 4, 12);
      }
      ctx.restore();
    }

    // Draw Player Arden
    PixelRenderer.drawKnight(
      ctx,
      this.px,
      this.py,
      this.pFacingRight,
      this.pAnimState,
      this.pAnimFrame,
      this.upgrades,
      this.pHurtTimer,
      this.stats.activeWeapon,
      this.stats.activeElement
    );

    // Draw Particles
    for (const part of this.particles) {
      ctx.save();
      ctx.globalAlpha = part.alpha;
      ctx.fillStyle = part.color;
      ctx.fillRect(part.x - part.size / 2, part.y - part.size / 2, part.size, part.size);
      ctx.restore();
    }

    // Draw Floating Damage Numbers
    ctx.font = '10px "Press Start 2P", monospace';
    for (const dn of this.damageNumbers) {
      ctx.save();
      ctx.globalAlpha = dn.alpha;
      ctx.fillStyle = '#000000';
      ctx.fillText(dn.text, dn.x + 1, dn.y + 1);
      ctx.fillStyle = dn.color;
      ctx.fillText(dn.text, dn.x, dn.y);
      ctx.restore();
    }

    ctx.restore(); // restore camera
    ctx.restore(); // restore screenshake
  }
}
