/**
 * Handcrafted 16-bit Retro Pixel Art Canvas Renderer
 * Draws Arden, Goblins, Dragon Drakon, Princess, Tiles, and FX
 */

import { UpgradeLevels, WeaponType, ElementType } from '../types';

export class PixelRenderer {
  // Draw Knight Arden
  public static drawKnight(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingRight: boolean,
    animState: 'idle' | 'walk' | 'jump' | 'attack' | 'heavy_attack' | 'block' | 'hurt' | 'victory',
    animFrame: number,
    upgrades: UpgradeLevels,
    hurtTimer: number = 0,
    weapon: WeaponType = 'sword',
    element: ElementType = 'fire'
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    // Hurt flash: white/red blinking
    if (hurtTimer > 0 && Math.floor(hurtTimer * 15) % 2 === 0) {
      ctx.filter = 'brightness(2.5) contrast(1.5)';
    }

    // Archer Dodge Roll pose when blocking
    const isArcherRoll = weapon === 'bow' && animState === 'block';
    if (isArcherRoll) {
      ctx.rotate(animFrame * 14);
    }

    const bob = animState === 'walk' ? Math.sin(animFrame * 12) * 2 : Math.sin(animFrame * 3) * 1;
    const legOffset = animState === 'walk' ? Math.sin(animFrame * 12) * 4 : 0;

    // Cape (behind body)
    ctx.fillStyle = upgrades.sword >= 4 ? '#b91c1c' : '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(-6, -18 + bob);
    ctx.lineTo(-12 - (animState === 'walk' ? 4 : 0), -4 + bob);
    ctx.lineTo(-16 - (animState === 'walk' ? 6 : 0), 8 + bob);
    ctx.lineTo(-6, 8 + bob);
    ctx.closePath();
    ctx.fill();

    // Legs / Boots
    ctx.fillStyle = '#334155'; // Dark armor
    // Left Leg
    ctx.fillRect(-6 + legOffset, 4 + bob, 4, 10);
    // Right Leg
    ctx.fillRect(2 - legOffset, 4 + bob, 4, 10);
    // Iron sabatons (feet)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-6 + legOffset, 12 + bob, 6, 4);
    ctx.fillRect(2 - legOffset, 12 + bob, 6, 4);

    // Torso / Cuirass (Color based on Armor Upgrade)
    let armorColor = '#94a3b8';
    let armorHighlight = '#cbd5e1';
    let armorTrim = '#475569';
    if (upgrades.armor === 3) {
      armorColor = '#0284c7'; // Knight's Hauberk
      armorHighlight = '#38bdf8';
      armorTrim = '#f59e0b';
    } else if (upgrades.armor === 4) {
      armorColor = '#ca8a04'; // Champion Aegis
      armorHighlight = '#fde047';
      armorTrim = '#78350f';
    } else if (upgrades.armor >= 5) {
      armorColor = '#b91c1c'; // Dragon Scale Armor
      armorHighlight = '#f87171';
      armorTrim = '#450a0a';
    }

    ctx.fillStyle = armorColor;
    ctx.fillRect(-7, -12 + bob, 14, 16);
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(-5, -12 + bob, 4, 14);
    ctx.fillStyle = armorTrim;
    ctx.fillRect(-7, 2 + bob, 14, 2); // Belt

    // Belt buckle
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-2, 1 + bob, 4, 4);

    // Helmet & Head
    ctx.fillStyle = armorColor;
    ctx.fillRect(-6, -26 + bob, 12, 14);
    ctx.fillStyle = armorHighlight;
    ctx.fillRect(-4, -26 + bob, 3, 12);

    // Visor / Eye slit
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-1, -21 + bob, 8, 3);
    // Eye gleam matches active element
    ctx.fillStyle = element === 'fire' ? '#f97316' : element === 'ice' ? '#38bdf8' : '#facc15';
    ctx.fillRect(1, -21 + bob, 2, 2);

    // Helmet Feather Plume
    ctx.fillStyle = element === 'fire' ? '#ef4444' : element === 'ice' ? '#06b6d4' : '#eab308';
    ctx.beginPath();
    ctx.moveTo(-6, -26 + bob);
    ctx.quadraticCurveTo(-14, -36 + bob, -4, -30 + bob);
    ctx.lineTo(-2, -26 + bob);
    ctx.fill();

    // --- SHIELD RENDERING BASED ON WEAPON ---
    // Archer: TIDAK menggunakan tameng!
    // Necromancer: Menggunakan tameng ILMU SIHIR (Magic Barrier)!
    // Sword: Tameng fisik perisai baja!
    if (weapon === 'sword') {
      if (animState === 'block') {
        this.drawShield(ctx, 4, -14 + bob, upgrades.shield, true);
      } else {
        this.drawShield(ctx, -8, -10 + bob, upgrades.shield, false);
      }
    } else if (weapon === 'staff') {
      if (animState === 'block') {
        // Glowing Magic Arcane Shield Ward
        this.drawMagicShield(ctx, 0, -8 + bob, upgrades.shield, element, animFrame);
      }
    }
    // Note: Archer has NO shield, only evasive acrobatic movement!

    // --- WEAPON RENDERING (Sword / Bow / Staff) ---
    if (weapon === 'sword') {
      if (animState === 'attack' || animState === 'heavy_attack') {
        ctx.save();
        ctx.translate(6, -8 + bob);
        ctx.rotate(animState === 'heavy_attack' ? 0.8 : 0.4);
        this.drawSword(ctx, upgrades.sword, animState === 'heavy_attack', element);
        ctx.restore();
      } else if (animState === 'victory') {
        ctx.save();
        ctx.translate(6, -20 + bob);
        ctx.rotate(-1.2);
        this.drawSword(ctx, upgrades.sword, false, element);
        ctx.restore();
      } else if (animState !== 'block') {
        ctx.save();
        ctx.translate(4, -4 + bob);
        ctx.rotate(0.2);
        this.drawSword(ctx, upgrades.sword, false, element);
        ctx.restore();
      }
    } else if (weapon === 'bow') {
      const isShooting = animState === 'attack' || animState === 'heavy_attack';
      ctx.save();
      ctx.translate(6, -10 + bob);
      if (isShooting) {
        ctx.rotate(0);
      } else {
        ctx.rotate(0.3);
      }
      this.drawBow(ctx, upgrades.sword, isShooting, element);
      ctx.restore();
    } else if (weapon === 'staff') {
      const isCasting = animState === 'attack' || animState === 'heavy_attack' || animState === 'block';
      ctx.save();
      ctx.translate(6, -8 + bob);
      if (isCasting) {
        ctx.rotate(-0.3);
      } else {
        ctx.rotate(0.1);
      }
      this.drawStaff(ctx, upgrades.sword, isCasting, element, animFrame);
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Magic Arcane Shield (Necromancer Staff)
  private static drawMagicShield(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    shieldTier: number,
    element: ElementType,
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    const radius = 22 + shieldTier * 1.5;
    const pulse = Math.sin(animFrame * 10) * 2;

    const baseColor =
      element === 'fire'
        ? 'rgba(239, 68, 68, 0.35)'
        : element === 'ice'
        ? 'rgba(56, 189, 248, 0.35)'
        : 'rgba(234, 179, 8, 0.35)';

    const strokeColor =
      element === 'fire'
        ? '#f87171'
        : element === 'ice'
        ? '#7dd3fc'
        : '#fde047';

    // Outer glow barrier
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Runic Circle
    ctx.save();
    ctx.rotate(animFrame * 4);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4 Arcane Rune nodes
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const rx = Math.cos(angle) * radius;
      const ry = Math.sin(angle) * radius;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx - 2, ry - 2, 4, 4);
    }
    ctx.restore();

    ctx.restore();
  }

  // Draw Archer's Bow
  private static drawBow(
    ctx: CanvasRenderingContext2D,
    tier: number,
    isDrawn: boolean,
    element: ElementType
  ) {
    const bowWood = tier >= 5 ? '#450a0a' : tier >= 3 ? '#1e293b' : '#78350f';
    const bowGlow = element === 'fire' ? '#ef4444' : element === 'ice' ? '#38bdf8' : '#facc15';

    ctx.save();
    // Bow limb curve
    ctx.strokeStyle = bowWood;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 15, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isDrawn) {
      ctx.moveTo(7, -13);
      ctx.lineTo(-4, 0); // Pulled back
      ctx.lineTo(7, 13);
    } else {
      ctx.moveTo(7, -13);
      ctx.lineTo(7, 13);
    }
    ctx.stroke();

    // Element infusion glow on bow tips
    ctx.fillStyle = bowGlow;
    ctx.fillRect(6, -15, 3, 3);
    ctx.fillRect(6, 12, 3, 3);

    // Nocked arrow when drawn
    if (isDrawn) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-6, -1, 18, 2); // shaft
      // Arrowhead
      ctx.fillStyle = bowGlow;
      ctx.beginPath();
      ctx.moveTo(12, -3);
      ctx.lineTo(16, 0);
      ctx.lineTo(12, 3);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Necromancer's Staff
  private static drawStaff(
    ctx: CanvasRenderingContext2D,
    tier: number,
    isCasting: boolean,
    element: ElementType,
    animFrame: number
  ) {
    const staffWood = tier >= 5 ? '#18181b' : tier >= 3 ? '#312e81' : '#451a03';
    const orbColor = element === 'fire' ? '#ef4444' : element === 'ice' ? '#06b6d4' : '#eab308';
    const innerColor = element === 'fire' ? '#fef08a' : element === 'ice' ? '#e0f2fe' : '#ffffff';

    ctx.save();
    // Staff Rod
    ctx.fillStyle = staffWood;
    ctx.fillRect(-2, -18, 4, 28);

    // Gold/Iron Mount
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-3, -20, 6, 3);

    // Crescent Mount Head
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -22, 6, -Math.PI * 0.8, Math.PI * 0.8);
    ctx.stroke();

    // Magic Orb on top
    const orbPulse = Math.sin(animFrame * 8) * 1.2;
    ctx.fillStyle = orbColor;
    ctx.beginPath();
    ctx.arc(0, -23, 4 + (isCasting ? orbPulse : 0), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = innerColor;
    ctx.beginPath();
    ctx.arc(0, -23, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Physical Shield (Knight Arden with Sword)
  private static drawShield(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    shieldTier: number,
    blocking: boolean
  ) {
    ctx.save();
    ctx.translate(x, y);
    if (blocking) {
      ctx.scale(1.2, 1.2);
    }

    let baseColor = '#78350f'; // Wood
    let rimColor = '#94a3b8';
    let insignia = '#f59e0b';

    if (shieldTier === 2) {
      baseColor = '#475569';
      rimColor = '#cbd5e1';
      insignia = '#38bdf8';
    } else if (shieldTier === 3) {
      baseColor = '#0369a1';
      rimColor = '#38bdf8';
      insignia = '#ffffff';
    } else if (shieldTier === 4) {
      baseColor = '#b45309';
      rimColor = '#fde047';
      insignia = '#facc15';
    } else if (shieldTier >= 5) {
      baseColor = '#991b1b'; // Dragon Ward
      rimColor = '#f87171';
      insignia = '#fbbf24';
    }

    // Shield shape: Heater / Kite
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.lineTo(6, -8);
    ctx.lineTo(6, 4);
    ctx.lineTo(0, 12);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Insignia / Boss center
    ctx.fillStyle = insignia;
    ctx.fillRect(-2, -2, 4, 4);

    ctx.restore();
  }

  // Draw Sword
  private static drawSword(
    ctx: CanvasRenderingContext2D,
    swordTier: number,
    isHeavy: boolean,
    element: ElementType = 'fire'
  ) {
    let bladeColor = '#cbd5e1';
    let hiltColor = '#78350f';
    let guardColor = '#94a3b8';
    let glow = '';

    if (swordTier === 2) {
      bladeColor = '#e2e8f0';
      guardColor = '#cbd5e1';
    } else if (swordTier === 3) {
      bladeColor = '#7dd3fc';
      guardColor = '#0284c7';
      hiltColor = '#1e293b';
      glow = 'rgba(56, 189, 248, 0.4)';
    } else if (swordTier === 4) {
      bladeColor = '#fef08a';
      guardColor = '#eab308';
      hiltColor = '#713f12';
      glow = 'rgba(250, 204, 21, 0.6)';
    } else if (swordTier >= 5) {
      bladeColor = '#ef4444';
      guardColor = '#991b1b';
      hiltColor = '#18181b';
      glow = 'rgba(239, 68, 68, 0.8)';
    }

    // Element infused blade tint
    if (element === 'fire') {
      glow = 'rgba(239, 68, 68, 0.8)';
      bladeColor = '#fca5a5';
    } else if (element === 'ice') {
      glow = 'rgba(56, 189, 248, 0.8)';
      bladeColor = '#bae6fd';
    } else if (element === 'lightning') {
      glow = 'rgba(234, 179, 8, 0.8)';
      bladeColor = '#fef08a';
    }

    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 8;
    }

    // Hilt & Pommel
    ctx.fillStyle = hiltColor;
    ctx.fillRect(-2, 10, 4, 8);
    ctx.fillStyle = guardColor;
    ctx.fillRect(-2, 18, 4, 3); // Pommel

    // Crossguard
    ctx.fillStyle = guardColor;
    ctx.fillRect(-6, 8, 12, 3);

    // Blade
    ctx.fillStyle = bladeColor;
    ctx.beginPath();
    ctx.moveTo(-3, 8);
    ctx.lineTo(-3, isHeavy ? -18 : -14);
    ctx.lineTo(0, isHeavy ? -22 : -18);
    ctx.lineTo(3, isHeavy ? -18 : -14);
    ctx.lineTo(3, 8);
    ctx.closePath();
    ctx.fill();

    // Fuller / Blade Center Line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.5, -10, 1, 16);

    ctx.shadowBlur = 0;
  }

  // Draw Goblin (Warrior, Archer, Elite)
  public static drawGoblin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: 'warrior' | 'archer' | 'elite',
    facingRight: boolean,
    animFrame: number,
    isAttacking: boolean,
    hurtTimer: number = 0
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    if (hurtTimer > 0 && Math.floor(hurtTimer * 15) % 2 === 0) {
      ctx.filter = 'brightness(2.5) contrast(1.5)';
    }

    const isElite = type === 'elite';
    const scale = isElite ? 1.4 : 1.0;
    ctx.scale(scale, scale);

    const bob = Math.sin(animFrame * 10) * 1.5;
    const skinColor = isElite ? '#15803d' : type === 'archer' ? '#65a30d' : '#22c55e';
    const skinDark = isElite ? '#14532d' : '#166534';

    // Feet / Legs
    ctx.fillStyle = '#451a03'; // Brown wraps
    ctx.fillRect(-5, 4 + bob, 3, 8);
    ctx.fillRect(2, 4 + bob, 3, 8);
    // Green toes
    ctx.fillStyle = skinColor;
    ctx.fillRect(-5, 10 + bob, 4, 3);
    ctx.fillRect(2, 10 + bob, 4, 3);

    // Torso & Clothes
    ctx.fillStyle = isElite ? '#334155' : '#78350f'; // Armor vs rags
    ctx.fillRect(-6, -10 + bob, 12, 14);

    if (isElite) {
      // Iron breastplate
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-5, -9 + bob, 10, 8);
    }

    // Head
    ctx.fillStyle = skinColor;
    ctx.fillRect(-6, -22 + bob, 12, 12);

    // Pointy Goblin Ears
    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.moveTo(-6, -18 + bob);
    ctx.lineTo(-12, -22 + bob);
    ctx.lineTo(-6, -14 + bob);
    ctx.fill();

    // Eyes (glowing yellow/red)
    ctx.fillStyle = isElite ? '#ef4444' : '#facc15';
    ctx.fillRect(1, -19 + bob, 3, 3);
    ctx.fillStyle = '#000';
    ctx.fillRect(2, -18 + bob, 1, 1);

    // Snout / Teeth
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(2, -13 + bob, 2, 2); // Underbite fangs

    // Helmet for Elite
    if (isElite) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(-6, -25 + bob, 12, 6);
      // Horns
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(-5, -25 + bob);
      ctx.lineTo(-10, -32 + bob);
      ctx.lineTo(-3, -25 + bob);
      ctx.fill();
    }

    // Weapon by type
    if (type === 'warrior') {
      // Jagged dagger / club
      ctx.fillStyle = '#64748b';
      const stab = isAttacking ? 6 : 0;
      ctx.fillRect(4 + stab, -8 + bob, 10, 3);
      ctx.fillRect(4 + stab, -9 + bob, 3, 5); // guard
    } else if (type === 'archer') {
      // Shortbow
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(6, -8 + bob, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(6, -16 + bob);
      ctx.lineTo(6, 0 + bob);
      ctx.stroke();
    } else if (isElite) {
      // Heavy Spiked Mace
      ctx.fillStyle = '#1e293b';
      const smash = isAttacking ? 1.0 : -0.5;
      ctx.save();
      ctx.translate(6, -10 + bob);
      ctx.rotate(smash);
      ctx.fillRect(-2, -18, 4, 22); // handle
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-6, -22, 12, 10); // spiked head
      ctx.fillStyle = '#f87171';
      ctx.fillRect(-8, -20, 2, 2); // spike
      ctx.fillRect(6, -20, 2, 2); // spike
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Dragon Drakon (Boss at Floor 5)
  public static drawDragon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingRight: boolean,
    animFrame: number,
    phase: number,
    attackMode: 'idle' | 'claw' | 'bite' | 'fire_breath' | 'flying',
    hurtTimer: number = 0
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    if (hurtTimer > 0 && Math.floor(hurtTimer * 15) % 2 === 0) {
      ctx.filter = 'brightness(2.5) contrast(1.5)';
    }

    const wingFlap = Math.sin(animFrame * (attackMode === 'flying' ? 14 : 5));
    const breathGlow = phase === 3 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(249, 115, 22, 0.2)';

    // Phase 3 rage aura
    if (phase === 3) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
    }

    // Back Wing
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.moveTo(-15, -40);
    ctx.lineTo(-50, -85 - wingFlap * 20);
    ctx.lineTo(-80, -75 - wingFlap * 15);
    ctx.lineTo(-45, -35);
    ctx.closePath();
    ctx.fill();

    // Tail (swaying)
    const tailWiggle = Math.sin(animFrame * 4) * 8;
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(-45, 10);
    ctx.quadraticCurveTo(-75 + tailWiggle, 5, -95 + tailWiggle, -10);
    ctx.lineTo(-90 + tailWiggle, 5);
    ctx.quadraticCurveTo(-70 + tailWiggle, 20, -45, 22);
    ctx.closePath();
    ctx.fill();
    // Tail spikes
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-92 + tailWiggle, -14, 6, 6);

    // Hind Leg & Claws
    ctx.fillStyle = '#5c1010';
    ctx.fillRect(-35, 10, 20, 30);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-40, 38, 8, 5);
    ctx.fillRect(-30, 38, 8, 5);

    // Dragon Body (Torso)
    ctx.fillStyle = '#7f1d1d'; // Crimson Obsidian
    ctx.beginPath();
    ctx.ellipse(0, 0, 48, 36, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Molten Underbelly Scales
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(10, 10, 28, 20, -0.1, 0, Math.PI);
    ctx.fill();

    // Front Leg & Claws
    const clawSwipe = attackMode === 'claw' ? 15 : 0;
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(15 + clawSwipe, 10, 18, 30);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(15 + clawSwipe, 38, 8, 5);
    ctx.fillRect(25 + clawSwipe, 38, 8, 5);

    // Long Draconic Neck
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(25, -15);
    ctx.quadraticCurveTo(45, -35, 55, -45);
    ctx.lineTo(40, -50);
    ctx.quadraticCurveTo(20, -35, 5, -20);
    ctx.closePath();
    ctx.fill();

    // Throat Glow when breathing fire
    if (attackMode === 'fire_breath' || phase >= 2) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(42, -38, 8, 12, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dragon Head
    const lunge = attackMode === 'bite' ? 20 : 0;
    ctx.fillStyle = '#5c1010';
    ctx.fillRect(45 + lunge, -65, 34, 24);

    // Large Horns
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(50 + lunge, -65);
    ctx.lineTo(30 + lunge, -85);
    ctx.lineTo(55 + lunge, -68);
    ctx.fill();

    // Jaws & Teeth
    const mouthOpen = attackMode === 'fire_breath' || attackMode === 'bite' ? 12 : 3;
    ctx.fillStyle = '#3f0808';
    ctx.fillRect(60 + lunge, -50, 22, mouthOpen);
    // Sharp white fangs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(64 + lunge, -50, 3, 4);
    ctx.fillRect(72 + lunge, -50, 3, 4);
    if (mouthOpen > 5) {
      ctx.fillRect(68 + lunge, -50 + mouthOpen - 4, 3, 4);
    }

    // Glowing Dragon Eye
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(58 + lunge, -60, 6, 5);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(60 + lunge, -59, 2, 3); // Slit pupil

    // Front Wing (flapping)
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(5, -20);
    ctx.lineTo(-30, -75 - wingFlap * 25);
    ctx.lineTo(-65, -60 - wingFlap * 20);
    ctx.lineTo(-20, -10);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(5, -20);
    ctx.lineTo(-30, -75 - wingFlap * 25);
    ctx.lineTo(-65, -60 - wingFlap * 20);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Princess Lyra
  public static drawPrincess(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isRescued: boolean,
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    const bob = Math.sin(animFrame * 4) * 1.5;

    // Royal Gown (Lavender / Pink)
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(-6, -10 + bob);
    ctx.lineTo(6, -10 + bob);
    ctx.lineTo(12, 16);
    ctx.lineTo(-12, 16);
    ctx.closePath();
    ctx.fill();

    // Golden dress trim
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-12, 14, 24, 2);

    // Torso
    ctx.fillStyle = '#e879f9';
    ctx.fillRect(-5, -18 + bob, 10, 9);

    // Head
    ctx.fillStyle = '#fed7aa'; // Peach skin
    ctx.fillRect(-4, -28 + bob, 8, 10);

    // Hair (Golden blonde flowing)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-6, -30 + bob, 12, 5);
    ctx.fillRect(-7, -26 + bob, 3, 14);
    ctx.fillRect(4, -26 + bob, 3, 14);

    // Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-2, -24 + bob, 2, 2);
    ctx.fillRect(2, -24 + bob, 2, 2);

    // Smile / Expression
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(0, -20 + bob, 2, 1);

    // Golden Tiara / Crown
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-4, -32 + bob, 8, 3);
    ctx.fillRect(-2, -34 + bob, 4, 2);

    // Cage / Chains if not rescued
    if (!isRescued) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.strokeRect(-18, -42, 36, 60);
      // Bars
      for (let i = -12; i <= 12; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, -42);
        ctx.lineTo(i, 18);
        ctx.stroke();
      }
      // Big Iron Lock
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-4, 0, 8, 10);
    }

    ctx.restore();
  }

  // Draw Stone Platform Tile
  public static drawPlatform(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    type: 'stone' | 'bridge' | 'moving' | 'ladder'
  ) {
    ctx.save();
    if (type === 'bridge') {
      // Wooden planks
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = '#451a03';
      for (let px = x; px < x + width; px += 16) {
        ctx.fillRect(px, y, 2, height);
      }
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x, y, width, 3);
    } else if (type === 'moving') {
      // Floating glowing runic stone
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x, y, width, 3);
      // Runic glyph in center
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + width / 2 - 8, y + 4, 16, 4);
    } else {
      // Standard Stone Blocks
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, width, 4); // Highlight edge
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y + height - 3, width, 3); // Shadow edge

      // Brick seams
      ctx.fillStyle = '#0f172a';
      for (let bx = x; bx < x + width; bx += 32) {
        ctx.fillRect(bx, y, 2, height);
      }
    }
    ctx.restore();
  }

  // Draw Torch
  public static drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number, animFrame: number) {
    ctx.save();
    // Wooden bracket
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 2, y, 4, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 4, y - 2, 8, 4);

    // Animated flame
    const flicker = Math.sin(animFrame * 15) * 2;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(x, y - 6, 6 + flicker, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(x, y - 6, 3 + flicker * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Trap (Spikes or Lava)
  public static drawTrap(ctx: CanvasRenderingContext2D, trap: { x: number; y: number; width: number; height: number; type: string }) {
    ctx.save();
    if (trap.type === 'spikes') {
      ctx.fillStyle = '#cbd5e1';
      for (let sx = trap.x; sx < trap.x + trap.width; sx += 12) {
        ctx.beginPath();
        ctx.moveTo(sx, trap.y + trap.height);
        ctx.lineTo(sx + 6, trap.y);
        ctx.lineTo(sx + 12, trap.y + trap.height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#dc2626'; // Blood traces on spikes
      for (let sx = trap.x; sx < trap.x + trap.width; sx += 24) {
        ctx.fillRect(sx + 5, trap.y + 2, 2, 4);
      }
    } else if (trap.type === 'lava') {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(trap.x, trap.y, trap.width, 6);
      ctx.fillStyle = '#fef08a';
      for (let lx = trap.x; lx < trap.x + trap.width; lx += 16) {
        ctx.fillRect(lx + Math.sin(lx) * 3, trap.y + 2, 6, 3);
      }
    }
    ctx.restore();
  }

  // Draw Treasure Chest
  public static drawChest(ctx: CanvasRenderingContext2D, chest: { x: number; y: number; width: number; height: number; opened: boolean }) {
    ctx.save();
    const { x, y, opened } = chest;

    // Base body
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, y + 8, 24, 16);

    // Iron bands
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 3, y + 8, 3, 16);
    ctx.fillRect(x + 18, y + 8, 3, 16);

    if (!opened) {
      // Closed lid
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x, y, 24, 8);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 3, y, 3, 8);
      ctx.fillRect(x + 18, y, 3, 8);

      // Gold lock
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 10, y + 6, 4, 6);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 11, y + 8, 2, 2);
    } else {
      // Opened lid flipped up
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x - 2, y - 8, 28, 8);

      // Golden loot gleam inside
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 2, y + 6, 20, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + 4, 3, 3);
      ctx.fillRect(x + 14, y + 5, 2, 2);
    }

    ctx.restore();
  }

  // Draw Exit Door / Portal
  public static drawDoor(ctx: CanvasRenderingContext2D, door: { x: number; y: number; locked: boolean; label: string }, animFrame: number) {
    ctx.save();
    const { x, y, locked } = door;

    // Carved stone archway
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 6, y - 10, 44, 64);

    // Archway top
    ctx.beginPath();
    ctx.arc(x + 16, y, 18, Math.PI, 0);
    ctx.fill();

    // Portal Interior
    if (locked) {
      // Locked iron portcullis gate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, 32, 54);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      for (let bx = x + 6; bx < x + 30; bx += 6) {
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx, y + 54);
        ctx.stroke();
      }
      // Red skull or lock
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 13, y + 22, 6, 8);
    } else {
      // Active swirling magic portal!
      const swirl = animFrame * 4;
      const grad = ctx.createLinearGradient(x, y, x + 32, y + 54);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.5, '#6366f1');
      grad.addColorStop(1, '#a855f7');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, 32, 54);

      // Swirling particles
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) {
        const px = x + 16 + Math.cos(swirl + i) * 10;
        const py = y + 27 + Math.sin(swirl + i) * 16;
        ctx.fillRect(px, py, 3, 3);
      }
    }

    ctx.restore();
  }

  // Draw Spinning Gold Coin
  public static drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, animFrame: number) {
    ctx.save();
    ctx.translate(x, y);
    const spin = Math.abs(Math.cos(animFrame * 8));
    const width = Math.max(2, 10 * spin);

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
