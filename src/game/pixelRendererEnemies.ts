import { EnemyType } from '../types';

export class EnemyRenderer {
  // Draw Wizards & Sorcerers (Map 2)
  public static drawWizard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: EnemyType,
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

    const floatBob = Math.sin(animFrame * 6) * 3;
    const robeColor =
      type === 'pyro_sorcerer'
        ? '#dc2626'
        : type === 'frost_necromancer'
        ? '#0284c7'
        : '#4f46e5';
    const robeDark =
      type === 'pyro_sorcerer'
        ? '#991b1b'
        : type === 'frost_necromancer'
        ? '#0369a1'
        : '#3730a3';
    const orbColor =
      type === 'pyro_sorcerer'
        ? '#f97316'
        : type === 'frost_necromancer'
        ? '#38bdf8'
        : '#c084fc';

    // Shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flowing Robe (Trapezoid)
    ctx.fillStyle = robeDark;
    ctx.beginPath();
    ctx.moveTo(-8, -12 + floatBob);
    ctx.lineTo(8, -12 + floatBob);
    ctx.lineTo(12, 2 + floatBob);
    ctx.lineTo(-12, 2 + floatBob);
    ctx.closePath();
    ctx.fill();

    // Robe Front Trim
    ctx.fillStyle = robeColor;
    ctx.fillRect(-4, -12 + floatBob, 8, 14);

    // Gold Trim Hem
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-12, 0 + floatBob, 24, 2);

    // Torso & Cowl
    ctx.fillStyle = robeDark;
    ctx.fillRect(-6, -22 + floatBob, 12, 10);

    // Hood / Hat
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.moveTo(-10, -22 + floatBob);
    ctx.lineTo(0, -38 + floatBob);
    ctx.lineTo(10, -22 + floatBob);
    ctx.closePath();
    ctx.fill();

    // Shadow inside hood
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(0, -20 + floatBob, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Eyes in hood
    ctx.fillStyle = orbColor;
    ctx.fillRect(-3, -21 + floatBob, 2, 2);
    ctx.fillRect(2, -21 + floatBob, 2, 2);

    // Magic Staff
    const staffTilt = isAttacking ? 0.3 : -0.1;
    ctx.save();
    ctx.translate(9, -8 + floatBob);
    ctx.rotate(staffTilt);

    // Shaft
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-1.5, -20, 3, 30);
    // Staff head
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-3, -24, 6, 5);
    // Glowing Magic Orb
    ctx.fillStyle = orbColor;
    ctx.beginPath();
    ctx.arc(0, -26, 4 + Math.sin(animFrame * 12) * 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -27, 2, 2);

    ctx.restore();
    ctx.restore();
  }

  // Draw Archmage Morvath (Floor 20 Boss)
  public static drawWizardBoss(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    boss: any,
    facingRight: boolean,
    animFrame: number,
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

    const floatBob = Math.sin(animFrame * 5) * 5;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spinning Arcane Rune Ring behind Morvath
    ctx.save();
    ctx.translate(0, -32 + floatBob);
    const ringSpin = animFrame * 2;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const angle = ringSpin + (i * Math.PI) / 3;
      const rx = Math.cos(angle) * 26;
      const ry = Math.sin(angle) * 26;
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(rx - 2, ry - 2, 4, 4);
    }
    ctx.restore();

    // Arcane Shield Bubble (If shielded)
    if (boss.shieldHp && boss.shieldHp > 0) {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(192, 132, 252, 0.15)';
      ctx.beginPath();
      ctx.arc(0, -28 + floatBob, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Grand Archmage Robes
    ctx.fillStyle = '#3b0764'; // Deep obsidian-purple
    ctx.beginPath();
    ctx.moveTo(-14, -20 + floatBob);
    ctx.lineTo(14, -20 + floatBob);
    ctx.lineTo(20, 6 + floatBob);
    ctx.lineTo(-20, 6 + floatBob);
    ctx.closePath();
    ctx.fill();

    // Ornate Gold Trim
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-6, -20 + floatBob, 12, 26);
    ctx.fillRect(-20, 4 + floatBob, 40, 3);

    // Torso & Ornate Mantle
    ctx.fillStyle = '#581c87';
    ctx.fillRect(-10, -34 + floatBob, 20, 14);

    // Gold Collar
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-12, -36 + floatBob, 24, 3);

    // Grand Pointed Crown / Headdress
    ctx.fillStyle = '#6b21a8';
    ctx.beginPath();
    ctx.moveTo(-14, -36 + floatBob);
    ctx.lineTo(0, -56 + floatBob);
    ctx.lineTo(14, -36 + floatBob);
    ctx.closePath();
    ctx.fill();

    // Golden Crown Spikes
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-4, -58 + floatBob, 8, 4);
    ctx.fillRect(-12, -44 + floatBob, 4, 8);
    ctx.fillRect(8, -44 + floatBob, 4, 8);

    // Glowing Face & Eyes
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(0, -30 + floatBob, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e879f9';
    ctx.fillRect(-4, -31 + floatBob, 3, 2);
    ctx.fillRect(2, -31 + floatBob, 3, 2);

    // Grand Staff of Eternity
    ctx.save();
    ctx.translate(16, -16 + floatBob);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-2, -36, 4, 46);
    // Gold filigree
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-5, -42, 10, 6);
    // Astral Star Core
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(0, -46, 7 + Math.sin(animFrame * 10) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -46, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // Draw Demons (Map 3)
  public static drawDemon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: EnemyType,
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

    if (type === 'nether_imp') {
      // Small winged demon flying
      const flap = Math.sin(animFrame * 14) * 5;
      const flyY = Math.sin(animFrame * 6) * 3;

      // Imp Wings
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.moveTo(-4, -14 + flyY);
      ctx.lineTo(-18, -26 + flyY + flap);
      ctx.lineTo(-8, -10 + flyY);
      ctx.closePath();
      ctx.fill();

      // Red Imp Body
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-6, -16 + flyY, 12, 14);

      // Horns
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(-6, -16 + flyY);
      ctx.lineTo(-10, -24 + flyY);
      ctx.lineTo(-3, -17 + flyY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(6, -16 + flyY);
      ctx.lineTo(10, -24 + flyY);
      ctx.lineTo(3, -17 + flyY);
      ctx.closePath();
      ctx.fill();

      // Imp Eyes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-3, -12 + flyY, 2, 2);
      ctx.fillRect(2, -12 + flyY, 2, 2);

      // Pitchfork Trident
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, -18 + flyY, 2, 22);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(4, -22 + flyY, 6, 4);
      ctx.fillRect(4, -26 + flyY, 2, 4);
      ctx.fillRect(8, -26 + flyY, 2, 4);
      ctx.fillRect(6, -26 + flyY, 2, 4);
    } else if (type === 'demon_hound') {
      // Quadruped Hellhound
      const runBob = Math.sin(animFrame * 12) * 2;
      ctx.fillStyle = '#18181b'; // Obsidian body
      ctx.fillRect(-12, -10 + runBob, 24, 12);

      // Magma cracks on back
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-8, -9 + runBob, 6, 2);
      ctx.fillRect(2, -8 + runBob, 8, 2);

      // Legs
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-10, 2 + runBob, 4, 8);
      ctx.fillRect(-4, 2 - runBob, 4, 8);
      ctx.fillRect(2, 2 + runBob, 4, 8);
      ctx.fillRect(8, 2 - runBob, 4, 8);

      // Snarling Head
      ctx.fillStyle = '#27272a';
      ctx.fillRect(8, -16 + runBob, 12, 10);
      // Fangs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, -8 + runBob, 2, 3);
      ctx.fillRect(18, -8 + runBob, 2, 3);

      // Glowing Fire Eyes
      ctx.fillStyle = '#f97316';
      ctx.fillRect(12, -14 + runBob, 3, 3);
      // Flame Spikes on Spine
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-10, -10 + runBob);
      ctx.lineTo(-8, -16 + runBob);
      ctx.lineTo(-4, -10 + runBob);
      ctx.closePath();
      ctx.fill();
    } else {
      // Hell Knight (Towering Armored Demon)
      const walkBob = Math.sin(animFrame * 8) * 1.5;

      // Dark Spiked Armor Legs
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-8, 0 + walkBob, 6, 12);
      ctx.fillRect(2, 0 - walkBob, 6, 12);

      // Red Glowing Greaves
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-7, 4 + walkBob, 4, 4);
      ctx.fillRect(3, 4 - walkBob, 4, 4);

      // Heavy Torso
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-12, -22 + walkBob, 24, 22);

      // Molten Core in Chest
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-4, -18 + walkBob, 8, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-2, -16 + walkBob, 4, 4);

      // Spiked Pauldrons
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(-16, -24 + walkBob, 6, 8);
      ctx.fillRect(10, -24 + walkBob, 6, 8);

      // Horned Helm
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-8, -34 + walkBob, 16, 12);
      // Demon Horns
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-8, -30 + walkBob);
      ctx.lineTo(-14, -42 + walkBob);
      ctx.lineTo(-4, -34 + walkBob);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(8, -30 + walkBob);
      ctx.lineTo(14, -42 + walkBob);
      ctx.lineTo(4, -34 + walkBob);
      ctx.closePath();
      ctx.fill();

      // Glowing Red Eye Visor
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-5, -28 + walkBob, 10, 2);

      // Great Hell Greatsword
      ctx.save();
      ctx.translate(14, -14 + walkBob);
      const swing = isAttacking ? 0.8 : 0;
      ctx.rotate(swing);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, 4, 4, 12);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-4, -28, 8, 32);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-1, -26, 2, 28);
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Lucifer - Lord of the Abyss (Floor 30 Ultimate Boss)
  public static drawLucifer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    boss: any,
    facingRight: boolean,
    animFrame: number,
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

    const floatBob = Math.sin(animFrame * 4) * 4;
    const wingBeat = Math.sin(animFrame * 8) * 8;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Colossal Burning Demon Wings
    ctx.fillStyle = '#450a0a';
    // Back Wing
    ctx.beginPath();
    ctx.moveTo(-10, -24 + floatBob);
    ctx.lineTo(-45, -70 + floatBob + wingBeat);
    ctx.lineTo(-20, -10 + floatBob);
    ctx.closePath();
    ctx.fill();

    // Front Wing
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(10, -24 + floatBob);
    ctx.lineTo(55, -75 + floatBob + wingBeat);
    ctx.lineTo(25, -10 + floatBob);
    ctx.closePath();
    ctx.fill();

    // Wing Claws
    ctx.fillStyle = '#09090b';
    ctx.fillRect(53, -77 + floatBob + wingBeat, 4, 6);
    ctx.fillRect(-47, -72 + floatBob + wingBeat, 4, 6);

    // Body & Demon Armor
    ctx.fillStyle = '#09090b'; // Obsidian armor
    ctx.fillRect(-16, -34 + floatBob, 32, 38);

    // Molten Abyssal Core
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-6, -26 + floatBob, 12, 16);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-3, -23 + floatBob, 6, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -21 + floatBob, 2, 6);

    // Massive Spiked Pauldrons
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(-24, -38 + floatBob, 10, 12);
    ctx.fillRect(14, -38 + floatBob, 10, 12);
    // Spikes on shoulders
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-22, -44 + floatBob, 4, 6);
    ctx.fillRect(18, -44 + floatBob, 4, 6);

    // Lucifer's Horned Crown
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-12, -54 + floatBob, 24, 20);

    // Massive Curved Brimstone Horns
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-12, -48 + floatBob);
    ctx.lineTo(-30, -68 + floatBob);
    ctx.lineTo(-8, -54 + floatBob);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, -48 + floatBob);
    ctx.lineTo(30, -68 + floatBob);
    ctx.lineTo(8, -54 + floatBob);
    ctx.closePath();
    ctx.fill();

    // Piercing Eyes of Damnation
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-7, -46 + floatBob, 4, 3);
    ctx.fillRect(3, -46 + floatBob, 4, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-5, -45 + floatBob, 2, 2);
    ctx.fillRect(5, -45 + floatBob, 2, 2);

    // Demonic Scepter / Apocalyptic Greatblade
    ctx.save();
    ctx.translate(22, -18 + floatBob);
    const bladeAngle = boss.attackMode === 'cleave' ? 0.9 : 0.1;
    ctx.rotate(bladeAngle);

    // Hilt
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(-3, 10, 6, 14);
    // Crossguard
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-10, 8, 20, 4);
    // Fiery Demon Blade
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-5, -44, 10, 52);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-2, -42, 4, 48);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-1, -38, 2, 40);

    ctx.restore();
    ctx.restore();
  }
}
