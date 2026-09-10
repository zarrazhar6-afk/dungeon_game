import React, { useState } from 'react';
import { PlayerStats, UpgradeLevels, WeaponType, ElementType } from '../types';
import { EnemyEntity } from '../game/engine';
import { Pause, Play, Shield, Zap, Sparkles, Keyboard, X, Flame, Snowflake } from 'lucide-react';

interface GameHUDProps {
  stats: PlayerStats;
  upgrades: UpgradeLevels;
  levelName: string;
  levelNumber: number;
  dragonBoss: EnemyEntity | null;
  isPaused: boolean;
  onTogglePause: () => void;
  onUsePotion: () => void;
  onSwitchWeapon?: (weapon: WeaponType) => void;
  onSwitchElement?: (element: ElementType) => void;
  onTriggerSkill?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  upgrades,
  levelName,
  levelNumber,
  dragonBoss,
  isPaused,
  onTogglePause,
  onUsePotion,
  onSwitchWeapon,
  onSwitchElement,
  onTriggerSkill,
}) => {
  const [showControlsHint, setShowControlsHint] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pixel_dungeon_show_controls');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleControlsHint = () => {
    setShowControlsHint((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pixel_dungeon_show_controls', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-start select-none z-20">
      {/* --- TOP ROW --- */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* Top Left: Knight Portrait, HP Bar & Quick Potion */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950/85 border-2 border-slate-700 p-2 rounded-lg pointer-events-auto backdrop-blur-xs shadow-xl">
            {/* Knight Mini Portrait */}
            <div className="w-11 h-11 bg-slate-800 border-2 border-slate-600 rounded flex items-center justify-center relative overflow-hidden shrink-0">
              {/* Plume & Helm Pixel representation */}
              <div className="w-6 h-6 bg-slate-400 rounded-sm flex flex-col items-center justify-center relative">
                <div
                  className="w-4 h-1.5 rounded-full absolute -top-1"
                  style={{ backgroundColor: upgrades.sword >= 3 ? '#ef4444' : '#3b82f6' }}
                />
                <div className="w-4 h-1 bg-slate-900 mt-1" />
                <div className="w-1.5 h-1 bg-cyan-400 absolute right-1 top-2" />
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-[130px] sm:min-w-[170px]">
              <div className="flex items-center justify-between text-[10px] font-pixel text-slate-200">
                <span className="font-bold text-amber-400">ARDEN</span>
                <span className="text-slate-300">
                  {stats.hp}/{stats.maxHp}
                </span>
              </div>

              {/* HP Bar Container */}
              <div className="w-full h-3.5 bg-slate-900 border border-slate-700 rounded-xs overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 transition-all duration-150"
                  style={{ width: `${hpPercent}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              </div>

              <div className="flex items-center gap-2 text-[9px] font-pixel text-slate-400">
                <span className="flex items-center gap-0.5 text-sky-400">
                  <Shield className="w-2.5 h-2.5 inline" /> DEF {stats.defense}
                </span>
                <span className="flex items-center gap-0.5 text-amber-400">
                  <Zap className="w-2.5 h-2.5 inline" /> ATK {stats.attack}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Potion Button (Positioned at Top-Left next to HP, never blocking the floor) */}
          <button
            id="btn-hud-potion"
            onClick={onUsePotion}
            disabled={stats.potions <= 0 || stats.hp >= stats.maxHp}
            className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg border font-pixel transition-all pointer-events-auto shadow-xl ${
              stats.potions > 0 && stats.hp < stats.maxHp
                ? 'bg-rose-950/90 border-rose-600 text-rose-200 hover:bg-rose-900 active:scale-95 cursor-pointer'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
            title="Gunakan Ramuan HP (Tekan tombol Q di keyboard)"
          >
            <div className="flex items-center gap-1">
              <span className="text-base leading-none">🧪</span>
              <span className="text-xs font-bold text-rose-300">x{stats.potions}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[8px] font-bold text-rose-200 bg-rose-800/80 px-1 py-0.2 rounded border border-rose-600/70">
                [Q]
              </span>
              <span className="text-[8px] text-slate-400 hidden sm:inline">HEAL</span>
            </div>
          </button>
        </div>

        {/* Top Center: Boss Health Bar */}
        {dragonBoss && dragonBoss.state !== 'dead' && (
          <div
            className={`flex flex-col items-center pointer-events-auto bg-slate-950/90 border-2 px-4 py-2 rounded-lg max-w-[320px] sm:max-w-[440px] w-full mx-2 shadow-2xl ${
              dragonBoss.type === 'lucifer'
                ? 'border-red-600 shadow-red-950/50'
                : dragonBoss.type === 'wizard_boss'
                ? 'border-purple-600 shadow-purple-950/50'
                : 'border-red-900/80 shadow-red-950/40'
            }`}
          >
            <div className="flex items-center justify-between w-full text-[10px] font-pixel mb-1">
              <span
                className={`font-bold tracking-wider flex items-center gap-1 ${
                  dragonBoss.type === 'lucifer'
                    ? 'text-red-400'
                    : dragonBoss.type === 'wizard_boss'
                    ? 'text-purple-300'
                    : 'text-red-400'
                }`}
              >
                <Sparkles className="w-3 h-3 fill-current" />
                {dragonBoss.type === 'lucifer'
                  ? 'LUCIFER — LORD OF THE ABYSS'
                  : dragonBoss.type === 'wizard_boss'
                  ? 'ARCHMAGE MORVATH — MASTER OF ARCANA'
                  : 'DRAKON — THE DUNGEON DRAGON'}
              </span>
              <span className="text-amber-400 font-semibold">
                PHASE {dragonBoss.dragonPhase || 1}
              </span>
            </div>

            {/* Boss Health Bar */}
            <div className="w-full h-4 bg-slate-900 border border-slate-700 rounded overflow-hidden relative">
              <div
                className={`h-full transition-all duration-100 ${
                  dragonBoss.type === 'lucifer'
                    ? 'bg-gradient-to-r from-red-900 via-rose-700 to-amber-500'
                    : dragonBoss.type === 'wizard_boss'
                    ? 'bg-gradient-to-r from-purple-900 via-indigo-600 to-cyan-400'
                    : 'bg-gradient-to-r from-red-800 via-red-600 to-orange-500'
                }`}
                style={{ width: `${Math.max(0, (dragonBoss.hp / dragonBoss.maxHp) * 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-pixel text-white/90 font-bold drop-shadow">
                {dragonBoss.hp} / {dragonBoss.maxHp}
              </div>
            </div>
          </div>
        )}

        {/* Top Right: Coins, Level, Controls Toggle & Pause button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Level Badge */}
          <div className="bg-slate-950/85 border border-slate-700 px-2.5 sm:px-3 py-1.5 rounded-lg flex flex-col items-end shadow-md">
            <span className="text-[8px] font-pixel text-slate-400">FLOOR {levelNumber}</span>
            <span className="text-[9px] sm:text-[10px] font-pixel text-cyan-400 truncate max-w-[100px] sm:max-w-none">
              {levelName}
            </span>
          </div>

          {/* Coins Badge */}
          <div className="bg-slate-950/85 border border-amber-600/60 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
            <span className="text-sm sm:text-base leading-none">🪙</span>
            <span className="text-xs font-pixel text-amber-300 font-bold">{stats.coins}</span>
          </div>

          {/* Controller Hints Toggle Button */}
          <button
            id="btn-hud-toggle-hints"
            onClick={toggleControlsHint}
            className={`px-2.5 py-2 rounded-lg border text-[9px] font-pixel flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              showControlsHint
                ? 'bg-amber-950/70 border-amber-500 text-amber-300 hover:bg-amber-900/80'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Klik untuk tampilkan / sembunyikan petunjuk kontrol keyboard"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{showControlsHint ? 'KONTROL: ON' : 'KONTROL: OFF'}</span>
          </button>

          {/* Pause Button */}
          <button
            id="btn-hud-pause"
            onClick={onTogglePause}
            className="bg-slate-900 hover:bg-slate-800 active:bg-slate-700 border border-slate-600 text-slate-200 p-2 rounded-lg transition-colors cursor-pointer shadow-md"
            title="Pause Game (ESC / P)"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-slate-200" />}
          </button>
        </div>
      </div>

      {/* --- MIDDLE ROW: WEAPONS, ELEMENTS & SKILL BAR --- */}
      <div className="flex flex-wrap items-center justify-between w-full mt-2 gap-2 pointer-events-auto">
        {/* Weapon Selector */}
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 p-1 rounded-lg shadow-lg">
          <span className="text-[8px] font-pixel text-slate-400 px-1 hidden sm:inline">SENJATA:</span>
          
          <button
            id="btn-hud-weapon-sword"
            onClick={() => onSwitchWeapon && onSwitchWeapon('sword')}
            className={`px-2 py-1 rounded text-[9px] font-pixel flex items-center gap-1 transition-all cursor-pointer ${
              stats.activeWeapon === 'sword'
                ? 'bg-amber-600 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Pedang Ksatria (Tameng Fisik) - Tekan [1]"
          >
            <span>🗡️</span>
            <span className="hidden md:inline">PEDANG</span>
            <span className="text-[7px] opacity-75">[1]</span>
          </button>

          <button
            id="btn-hud-weapon-bow"
            onClick={() => onSwitchWeapon && onSwitchWeapon('bow')}
            className={`px-2 py-1 rounded text-[9px] font-pixel flex items-center gap-1 transition-all cursor-pointer ${
              stats.activeWeapon === 'bow'
                ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Busur Archer (Tanpa Tameng, Roll Menghindar) - Tekan [2]"
          >
            <span>🏹</span>
            <span className="hidden md:inline">ARCHER</span>
            <span className="text-[7px] opacity-75">[2]</span>
          </button>

          <button
            id="btn-hud-weapon-staff"
            onClick={() => onSwitchWeapon && onSwitchWeapon('staff')}
            className={`px-2 py-1 rounded text-[9px] font-pixel flex items-center gap-1 transition-all cursor-pointer ${
              stats.activeWeapon === 'staff'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Tongkat Necromancer (Tameng Perisai Sihir) - Tekan [3]"
          >
            <span>🪄</span>
            <span className="hidden md:inline">SIHIR</span>
            <span className="text-[7px] opacity-75">[3]</span>
          </button>
        </div>

        {/* Element Selector & Elemental Skill */}
        <div className="flex items-center gap-2">
          {/* Elements */}
          <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 p-1 rounded-lg shadow-lg">
            <span className="text-[8px] font-pixel text-slate-400 px-1 hidden sm:inline">ELEMEN [R]:</span>
            
            <button
              id="btn-hud-elem-fire"
              onClick={() => onSwitchElement && onSwitchElement('fire')}
              className={`px-2 py-1 rounded text-[9px] font-pixel flex items-center gap-1 transition-all cursor-pointer ${
                stats.activeElement === 'fire'
                  ? 'bg-orange-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
              title="Elemen Api (Bakar & Ledakan) - Tekan [R]"
            >
              <span>🔥</span>
              <span className="hidden lg:inline">API</span>
            </button>

            <button
              id="btn-hud-elem-ice"
              onClick={() => onSwitchElement && onSwitchElement('ice')}
              className={`px-2 py-1 rounded text-[9px] font-pixel flex items-center gap-1 transition-all cursor-pointer ${
                stats.activeElement === 'ice'
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
              title="Elemen Es (Bekukan & Perlambat Lawan) - Tekan [R]"
            >
              <span>❄️</span>
              <span className="hidden lg:inline">ES</span>
            </button>

            <button
              id="btn-hud-elem-lightning"
              onClick={() => onSwitchElement && onSwitchElement('lightning')}
              className={`px-2 py-1 rounded text-[9px] font-pixel flex items-center gap-1 transition-all cursor-pointer ${
                stats.activeElement === 'lightning'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
              title="Elemen Petir (Tembus & Sambaran Cepat) - Tekan [R]"
            >
              <span>⚡</span>
              <span className="hidden lg:inline">PETIR</span>
            </button>
          </div>

          {/* Elemental Skill Trigger Button */}
          <button
            id="btn-hud-element-skill"
            onClick={onTriggerSkill}
            disabled={(stats.elementSkillCooldown || 0) > 0}
            className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-pixel flex items-center gap-1.5 shadow-xl transition-all ${
              (stats.elementSkillCooldown || 0) > 0
                ? 'bg-slate-900/80 border-slate-700 text-slate-500 cursor-not-allowed'
                : stats.activeElement === 'fire'
                ? 'bg-gradient-to-r from-red-600 to-orange-500 border-orange-400 text-white hover:brightness-110 active:scale-95 cursor-pointer animate-pulse'
                : stats.activeElement === 'ice'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-400 border-sky-300 text-white hover:brightness-110 active:scale-95 cursor-pointer animate-pulse'
                : 'bg-gradient-to-r from-amber-600 to-yellow-400 border-yellow-300 text-slate-950 font-bold hover:brightness-110 active:scale-95 cursor-pointer animate-pulse'
            }`}
            title="Keluarkan Skil Elemen Senjata (Tekan U atau F)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {(stats.elementSkillCooldown || 0) > 0
                ? `${(stats.elementSkillCooldown || 0).toFixed(1)}s`
                : stats.activeWeapon === 'sword'
                ? stats.activeElement === 'fire'
                  ? 'FLAMESTRIKE'
                  : stats.activeElement === 'ice'
                  ? 'FROSTBLADE'
                  : 'THUNDER CLEAVE'
                : stats.activeWeapon === 'bow'
                ? stats.activeElement === 'fire'
                  ? 'HELL ARROW'
                  : stats.activeElement === 'ice'
                  ? 'FROST VOLLEY'
                  : 'STORM BOLT'
                : stats.activeElement === 'fire'
                ? 'METEOR'
                : stats.activeElement === 'ice'
                ? 'FROST NOVA'
                : 'NETHER LIGHTNING'}
            </span>
            <span className="text-[8px] bg-black/40 px-1 py-0.5 rounded border border-white/20">[U/F]</span>
          </button>
        </div>
      </div>

      {/* --- FLOATING TOP CONTROLS GUIDE (Placed safely at top, toggleable, never blocking gameplay) --- */}
      {showControlsHint && (
        <div className="flex items-center justify-center w-full mt-2 pointer-events-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-slate-950/90 border border-slate-700/90 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md text-[9px] font-pixel text-slate-300 max-w-3xl">
            <span className="text-amber-400 font-bold hidden lg:inline mr-1">🎮 KONTROL:</span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-amber-300 font-bold">A/D</kbd> Gerak
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-amber-300 font-bold">W</kbd> Lompat
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-amber-300 font-bold">Spasi</kbd> Serang
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-amber-300 font-bold">K</kbd> Berat
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-amber-300 font-bold">E</kbd> Tangkis / Peti
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-amber-300 font-bold">Shift</kbd> Dash
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-amber-300 font-bold">1/2/3</kbd> Senjata
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-amber-300 font-bold">R</kbd> Elemen
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 border border-slate-600 px-1 py-0.5 rounded text-amber-300 font-bold">U/F</kbd> Skil
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-rose-950 border border-rose-600 px-1 py-0.5 rounded text-rose-300 font-bold">Q</kbd> Potion
            </span>

            {/* Quick close button */}
            <button
              id="btn-close-controls-hint"
              onClick={toggleControlsHint}
              className="ml-1 text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Petunjuk Kontrol (bisa dibuka lagi lewat tombol [KONTROL] di atas)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
