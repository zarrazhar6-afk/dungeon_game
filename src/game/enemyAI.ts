import { EnemyEntity } from './engine';
import { audio } from './audio';

export class EnemyAI {
  // Check if enemy fell out of bounds or into deadly hazards
  public static checkEnemyBounds(engine: any, enemy: EnemyEntity): boolean {
    if (enemy.state === 'dead') return true;

    // Check if fallen below level floor
    if (enemy.y > engine.currentLevel.config.height + 30) {
      engine.handleEnemyDeath(enemy, true);
      return true;
    }

    // Check if fallen into lava or spikes
    for (const trap of engine.currentLevel.traps) {
      if (
        enemy.x > trap.x - 10 &&
        enemy.x < trap.x + trap.width + 10 &&
        enemy.y >= trap.y &&
        enemy.y <= trap.y + trap.height + 20
      ) {
        enemy.hp -= trap.damage;
        engine.addDamageNumber(enemy.x, enemy.y - 20, `-${trap.damage}`, '#ef4444');
        enemy.vy = -5; // Bounce off trap
        if (enemy.hp <= 0) {
          engine.handleEnemyDeath(enemy, true);
          return true;
        }
      }
    }

    return false;
  }

  // --- GOBLIN AI (Map 1) ---
  public static updateGoblin(engine: any, enemy: EnemyEntity, dt: number) {
    if (EnemyAI.checkEnemyBounds(engine, enemy)) return;

    const distToPlayer = Math.hypot(engine.px - enemy.x, engine.py - enemy.y);

    // Apply gravity
    enemy.vy += 22 * dt;
    enemy.y += enemy.vy;

    // Platform collision
    for (const plat of engine.currentLevel.platforms) {
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
      enemy.facingRight = engine.px > enemy.x;

      if (enemy.type === 'archer') {
        if (distToPlayer < 80) {
          enemy.x += (enemy.facingRight ? -1 : 1) * enemy.speed;
        } else if (distToPlayer > 260) {
          enemy.x += (enemy.facingRight ? 1 : -1) * enemy.speed;
        }

        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 2.0;
          engine.shootArrow(enemy.x, enemy.y - 12, enemy.facingRight, enemy.attack);
        }
      } else {
        const attackRange = enemy.type === 'elite' ? 44 : 32;
        if (distToPlayer > attackRange) {
          enemy.x += (enemy.facingRight ? 1 : -1) * enemy.speed;
        } else if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = enemy.type === 'elite' ? 1.6 : 1.1;
          engine.takePlayerDamage(enemy.attack);
          audio.playSlash(enemy.type === 'elite');
        }
      }
    } else {
      // Patrol
      if (enemy.x <= enemy.patrolMinX) enemy.facingRight = true;
      if (enemy.x >= enemy.patrolMaxX) enemy.facingRight = false;
      enemy.x += (enemy.facingRight ? 1 : -1) * (enemy.speed * 0.5);
    }
  }

  // --- WIZARD / SORCERER AI (Map 2) ---
  public static updateWizard(engine: any, enemy: EnemyEntity, dt: number) {
    if (EnemyAI.checkEnemyBounds(engine, enemy)) return;

    const distToPlayer = Math.hypot(engine.px - enemy.x, engine.py - enemy.y);

    // Wizards levitate slightly above platforms
    enemy.vy += 15 * dt;
    enemy.y += enemy.vy;

    for (const plat of engine.currentLevel.platforms) {
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

    enemy.facingRight = engine.px > enemy.x;

    // Teleportation evasion if player gets too close
    if (distToPlayer < 65 && Math.random() < 0.05 && enemy.attackCooldown <= 0.8) {
      const teleportOffset = (enemy.facingRight ? -140 : 140);
      const newX = Math.max(enemy.patrolMinX, Math.min(enemy.patrolMaxX, enemy.x + teleportOffset));
      // Teleport sparks
      for (let i = 0; i < 10; i++) {
        engine.particles.push({
          x: enemy.x,
          y: enemy.y - 15,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: '#c084fc',
          size: 4,
          life: 0.4,
          maxLife: 0.4,
          alpha: 1,
          type: 'spark',
        });
      }
      enemy.x = newX;
      audio.playBlock();
      return;
    }

    // Wizard attack patterns
    if (distToPlayer < 360) {
      if (enemy.attackCooldown <= 0) {
        if (enemy.type === 'pyro_sorcerer') {
          enemy.attackCooldown = 2.2;
          engine.shootFireball(enemy.x, enemy.y - 16, enemy.facingRight, enemy.attack);
        } else if (enemy.type === 'frost_necromancer') {
          enemy.attackCooldown = 2.0;
          engine.shootIceShard(enemy.x, enemy.y - 16, enemy.facingRight, enemy.attack);
        } else {
          // Apprentice Mage: homing arcane orb
          enemy.attackCooldown = 2.5;
          engine.shootArcaneOrb(enemy.x, enemy.y - 16, engine.px, engine.py - 16, enemy.attack);
        }
      }
    } else {
      // Hover patrol
      if (enemy.x <= enemy.patrolMinX) enemy.facingRight = true;
      if (enemy.x >= enemy.patrolMaxX) enemy.facingRight = false;
      enemy.x += (enemy.facingRight ? 1 : -1) * (enemy.speed * 0.4);
    }
  }

  // --- ARCHMAGE MORVATH BOSS (Floor 20) ---
  public static updateWizardBoss(engine: any, boss: EnemyEntity, dt: number) {
    if (EnemyAI.checkEnemyBounds(engine, boss)) return;

    const hpRatio = boss.hp / boss.maxHp;
    const distToPlayer = Math.hypot(engine.px - boss.x, engine.py - boss.y);
    boss.facingRight = engine.px > boss.x;

    // Levitation
    boss.vy += 12 * dt;
    boss.y += boss.vy;
    for (const plat of engine.currentLevel.platforms) {
      if (
        boss.vy >= 0 &&
        boss.x > plat.x - 10 &&
        boss.x < plat.x + plat.width + 10 &&
        boss.y >= plat.y &&
        boss.y - boss.vy <= plat.y + 16
      ) {
        boss.y = plat.y;
        boss.vy = 0;
      }
    }

    // Phase transitions
    if (hpRatio <= 0.3) {
      boss.dragonPhase = 3; // Overdrive
    } else if (hpRatio <= 0.6) {
      boss.dragonPhase = 2; // Meteor Storm
    } else {
      boss.dragonPhase = 1;
    }

    // Teleport logic when attacked or periodic
    if (!boss.teleportTimer) boss.teleportTimer = 4.0;
    boss.teleportTimer -= dt;

    if (boss.teleportTimer <= 0 || (distToPlayer < 70 && Math.random() < 0.08)) {
      boss.teleportTimer = boss.dragonPhase === 3 ? 3.0 : 4.5;
      const teleLocations = [1200, 1450, 1750, 950];
      const targetX = teleLocations[Math.floor(Math.random() * teleLocations.length)];
      for (let i = 0; i < 20; i++) {
        engine.particles.push({
          x: boss.x,
          y: boss.y - 25,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: '#a855f7',
          size: 5,
          life: 0.5,
          maxLife: 0.5,
          alpha: 1,
          type: 'spark',
        });
      }
      boss.x = targetX;
      audio.playBlock();
    }

    // Attacks
    if (boss.attackCooldown <= 0) {
      if (boss.dragonPhase === 3) {
        // Phase 3: Triple rapid arcane barrage + lightning
        boss.attackCooldown = 1.6;
        engine.shootArcaneOrb(boss.x, boss.y - 30, engine.px, engine.py - 16, boss.attack);
        engine.shootIceShard(boss.x, boss.y - 20, boss.facingRight, boss.attack);
        engine.shootFireball(boss.x, boss.y - 40, boss.facingRight, boss.attack);
      } else if (boss.dragonPhase === 2) {
        // Phase 2: Arcane Meteors from sky
        boss.attackCooldown = 2.4;
        engine.screenShake = 6;
        for (let i = -1; i <= 1; i++) {
          engine.projectiles.push({
            id: `meteor_${Date.now()}_${i}`,
            x: engine.px + i * 110 + (Math.random() * 40 - 20),
            y: 40,
            vx: 0,
            vy: 7.5,
            width: 16,
            height: 16,
            damage: boss.attack,
            fromPlayer: false,
            type: 'arcane_orb',
            life: 3,
          });
        }
        audio.playFireball();
      } else {
        // Phase 1: Dual Homing Arcane Orbs
        boss.attackCooldown = 2.2;
        engine.shootArcaneOrb(boss.x, boss.y - 30, engine.px, engine.py - 16, boss.attack);
        setTimeout(() => {
          if (engine.isRunning && boss.state !== 'dead') {
            engine.shootArcaneOrb(boss.x, boss.y - 20, engine.px, engine.py - 16, boss.attack);
          }
        }, 300);
      }
    }
  }

  // --- DEMON AI (Map 3) ---
  public static updateDemon(engine: any, enemy: EnemyEntity, dt: number) {
    if (EnemyAI.checkEnemyBounds(engine, enemy)) return;

    const distToPlayer = Math.hypot(engine.px - enemy.x, engine.py - enemy.y);

    if (enemy.type === 'nether_imp') {
      // Flying Imp
      enemy.facingRight = engine.px > enemy.x;
      // Hover above player
      const targetHoverY = engine.py - 90 + Math.sin(enemy.animFrame * 5) * 20;
      const targetHoverX = engine.px + (enemy.facingRight ? -120 : 120);

      enemy.x += (targetHoverX - enemy.x) * 0.04;
      enemy.y += (targetHoverY - enemy.y) * 0.04;

      if (distToPlayer < 300 && enemy.attackCooldown <= 0) {
        enemy.attackCooldown = 2.2;
        engine.shootHellfire(enemy.x, enemy.y, enemy.facingRight, enemy.attack);
      }
    } else if (enemy.type === 'demon_hound') {
      // Fast leaping hellhound
      enemy.vy += 24 * dt;
      enemy.y += enemy.vy;

      for (const plat of engine.currentLevel.platforms) {
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

      if (distToPlayer < 260) {
        enemy.facingRight = engine.px > enemy.x;

        // Leaping pounce attack!
        if (distToPlayer < 140 && enemy.attackCooldown <= 0 && enemy.vy === 0) {
          enemy.vy = -7.5;
          enemy.vx = (enemy.facingRight ? 1 : -1) * 7;
          enemy.attackCooldown = 1.8;
          audio.playSlash(true);
        } else if (distToPlayer > 36) {
          enemy.x += (enemy.facingRight ? 1 : -1) * (enemy.speed * 1.3);
        } else if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 1.2;
          engine.takePlayerDamage(enemy.attack);
          audio.playSlash(false);
        }
      } else {
        // Patrol
        if (enemy.x <= enemy.patrolMinX) enemy.facingRight = true;
        if (enemy.x >= enemy.patrolMaxX) enemy.facingRight = false;
        enemy.x += (enemy.facingRight ? 1 : -1) * enemy.speed;
      }
    } else {
      // Hell Knight (Heavily Armored Demonic Champion)
      enemy.vy += 24 * dt;
      enemy.y += enemy.vy;

      for (const plat of engine.currentLevel.platforms) {
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

      if (distToPlayer < 240) {
        enemy.facingRight = engine.px > enemy.x;
        const attackRange = 50;

        if (distToPlayer > attackRange) {
          enemy.x += (enemy.facingRight ? 1 : -1) * enemy.speed;
        } else if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 1.6;
          engine.takePlayerDamage(enemy.attack);
          engine.screenShake = 4;
          audio.playSlash(true);
        }
      } else {
        if (enemy.x <= enemy.patrolMinX) enemy.facingRight = true;
        if (enemy.x >= enemy.patrolMaxX) enemy.facingRight = false;
        enemy.x += (enemy.facingRight ? 1 : -1) * (enemy.speed * 0.5);
      }
    }
  }

  // --- LUCIFER FINAL BOSS (Floor 30) ---
  public static updateLuciferBoss(engine: any, boss: EnemyEntity, dt: number) {
    if (EnemyAI.checkEnemyBounds(engine, boss)) return;

    const hpRatio = boss.hp / boss.maxHp;
    const distToPlayer = Math.hypot(engine.px - boss.x, engine.py - boss.y);
    boss.facingRight = engine.px > boss.x;

    // Levitate / flight
    boss.vy += 12 * dt;
    boss.y += boss.vy;
    for (const plat of engine.currentLevel.platforms) {
      if (
        boss.vy >= 0 &&
        boss.x > plat.x - 20 &&
        boss.x < plat.x + plat.width + 20 &&
        boss.y >= plat.y &&
        boss.y - boss.vy <= plat.y + 20
      ) {
        boss.y = plat.y;
        boss.vy = 0;
      }
    }

    // Phases
    if (hpRatio <= 0.3) {
      boss.dragonPhase = 3; // Apocalyptic Doom
    } else if (hpRatio <= 0.65) {
      boss.dragonPhase = 2; // Blood Scythe & Hell Pillars
    } else {
      boss.dragonPhase = 1; // Greatsword Cleave
    }

    // Movement: slowly hovers towards player
    if (distToPlayer > 120) {
      boss.x += (boss.facingRight ? 1 : -1) * boss.speed;
    }

    // Attack cooldown tick
    if (boss.attackCooldown <= 0) {
      if (boss.dragonPhase === 3) {
        // Phase 3: Screaming Hell Barrage & Hellfire rain
        boss.attackCooldown = 1.7;
        engine.screenShake = 12;
        engine.shootHellfire(boss.x, boss.y - 35, boss.facingRight, boss.attack);
        engine.shootDarkScythe(boss.x, boss.y - 25, boss.facingRight, boss.attack);

        // Volcanic rain
        for (let i = -1; i <= 1; i++) {
          engine.projectiles.push({
            id: `hellrain_${Date.now()}_${i}`,
            x: engine.px + i * 90 + (Math.random() * 30 - 15),
            y: 30,
            vx: 0,
            vy: 8,
            width: 18,
            height: 18,
            damage: boss.attack,
            fromPlayer: false,
            type: 'hellfire',
            life: 3,
          });
        }
        audio.playDragonRoar();
      } else if (boss.dragonPhase === 2) {
        // Phase 2: Boomerang Dark Scythe & Hellfire
        boss.attackCooldown = 2.2;
        engine.shootDarkScythe(boss.x, boss.y - 30, boss.facingRight, boss.attack);
        engine.shootHellfire(boss.x, boss.y - 20, boss.facingRight, boss.attack);
        audio.playSlash(true);
      } else {
        // Phase 1: Heavy Greatsword Cleave or Hellfire
        boss.attackCooldown = 2.2;
        if (distToPlayer < 90) {
          boss.attackMode = 'cleave';
          engine.takePlayerDamage(boss.attack * 1.2);
          engine.screenShake = 8;
          audio.playSlash(true);
          setTimeout(() => {
            boss.attackMode = 'idle';
          }, 400);
        } else {
          engine.shootHellfire(boss.x, boss.y - 30, boss.facingRight, boss.attack);
        }
      }
    }
  }
}
