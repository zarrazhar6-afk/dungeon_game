import React from 'react';
import { GameEngine } from '../game/engine';

interface VirtualControlsProps {
  engine: GameEngine | null;
  enabled: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({ engine, enabled }) => {
  if (!enabled || !engine) return null;

  const handleTouchStart = (action: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    action();
  };

  const handleTouchEnd = (action?: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    if (action) action();
  };

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none p-3 select-none touch-none-select flex items-end justify-between z-20 pb-4">
      {/* Left: Movement D-Pad */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 bg-slate-950/60 p-2 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
        {/* Jump Button */}
        <button
          id="btn-vpad-up"
          onPointerDown={handleTouchStart(() => {
            engine.keys['w'] = true;
          })}
          onPointerUp={handleTouchEnd(() => {
            engine.keys['w'] = false;
          })}
          onPointerLeave={handleTouchEnd(() => {
            engine.keys['w'] = false;
          })}
          className="w-12 h-12 bg-slate-800 active:bg-cyan-700 border-2 border-slate-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
        >
          ▲
        </button>

        {/* Left & Right */}
        <div className="flex items-center gap-2">
          <button
            id="btn-vpad-left"
            onPointerDown={handleTouchStart(() => {
              engine.keys['a'] = true;
            })}
            onPointerUp={handleTouchEnd(() => {
              engine.keys['a'] = false;
            })}
            onPointerLeave={handleTouchEnd(() => {
              engine.keys['a'] = false;
            })}
            className="w-12 h-12 bg-slate-800 active:bg-cyan-700 border-2 border-slate-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
          >
            ◀
          </button>

          <button
            id="btn-vpad-down"
            onPointerDown={handleTouchStart(() => {
              engine.keys['s'] = true;
            })}
            onPointerUp={handleTouchEnd(() => {
              engine.keys['s'] = false;
            })}
            onPointerLeave={handleTouchEnd(() => {
              engine.keys['s'] = false;
            })}
            className="w-12 h-12 bg-slate-800 active:bg-slate-700 border-2 border-slate-600 rounded-xl flex items-center justify-center text-slate-400 text-lg font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
          >
            ▼
          </button>

          <button
            id="btn-vpad-right"
            onPointerDown={handleTouchStart(() => {
              engine.keys['d'] = true;
            })}
            onPointerUp={handleTouchEnd(() => {
              engine.keys['d'] = false;
            })}
            onPointerLeave={handleTouchEnd(() => {
              engine.keys['d'] = false;
            })}
            className="w-12 h-12 bg-slate-800 active:bg-cyan-700 border-2 border-slate-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Right: Action Buttons (Attack, Heavy, Skill, Dash, Block, Switchers) */}
      <div className="pointer-events-auto flex items-end gap-2 bg-slate-950/60 p-2 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
        {/* Switchers column: Weapon & Element */}
        <div className="flex flex-col gap-2">
          {/* Cycle Weapon */}
          <button
            id="btn-vact-cycle-weapon"
            onPointerDown={handleTouchStart(() => {
              engine.cycleWeapon();
            })}
            className="w-10 h-10 bg-slate-800 active:bg-slate-700 border-2 border-slate-600 rounded-xl flex flex-col items-center justify-center text-white shadow-md cursor-pointer active:scale-95 transition-transform"
            title="Ganti Senjata (Pedang / Busur / Sihir)"
          >
            <span className="text-sm">
              {engine.stats.activeWeapon === 'sword' ? '🗡️' : engine.stats.activeWeapon === 'bow' ? '🏹' : '🪄'}
            </span>
            <span className="text-[6px] font-pixel text-slate-300">WEAPON</span>
          </button>

          {/* Cycle Element */}
          <button
            id="btn-vact-cycle-elem"
            onPointerDown={handleTouchStart(() => {
              engine.cycleElement();
            })}
            className="w-10 h-10 bg-slate-800 active:bg-slate-700 border-2 border-slate-600 rounded-xl flex flex-col items-center justify-center text-white shadow-md cursor-pointer active:scale-95 transition-transform"
            title="Ganti Elemen (Api / Es / Petir)"
          >
            <span className="text-sm">
              {engine.stats.activeElement === 'fire' ? '🔥' : engine.stats.activeElement === 'ice' ? '❄️' : '⚡'}
            </span>
            <span className="text-[6px] font-pixel text-amber-300">ELEM</span>
          </button>
        </div>

        {/* Dash & Block column */}
        <div className="flex flex-col gap-2">
          {/* Dash */}
          <button
            id="btn-vact-dash"
            onPointerDown={handleTouchStart(() => {
              engine.triggerDash();
            })}
            className="w-11 h-11 bg-sky-900 active:bg-sky-700 border-2 border-sky-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md cursor-pointer active:scale-95 transition-transform"
            title="Dash"
          >
            <span className="text-base">💨</span>
            <span className="text-[7px] font-pixel text-sky-200">DASH</span>
          </button>

          {/* Block */}
          <button
            id="btn-vact-block"
            onPointerDown={handleTouchStart(() => {
              engine.triggerBlock(true);
            })}
            onPointerUp={handleTouchEnd(() => {
              engine.triggerBlock(false);
            })}
            onPointerLeave={handleTouchEnd(() => {
              engine.triggerBlock(false);
            })}
            className={`w-11 h-11 border-2 rounded-xl flex flex-col items-center justify-center text-white shadow-md cursor-pointer active:scale-95 transition-transform ${
              engine.stats.activeWeapon === 'bow'
                ? 'bg-emerald-950 active:bg-emerald-800 border-emerald-500'
                : engine.stats.activeWeapon === 'staff'
                ? 'bg-purple-950 active:bg-purple-800 border-purple-500'
                : 'bg-amber-900 active:bg-amber-700 border-amber-500'
            }`}
            title={engine.stats.activeWeapon === 'bow' ? 'Roll Menghindar' : engine.stats.activeWeapon === 'staff' ? 'Perisai Sihir' : 'Tangkis Tameng'}
          >
            <span className="text-base">
              {engine.stats.activeWeapon === 'bow' ? '🤸' : engine.stats.activeWeapon === 'staff' ? '🔮' : '🛡'}
            </span>
            <span className="text-[7px] font-pixel text-amber-200">
              {engine.stats.activeWeapon === 'bow' ? 'ROLL' : engine.stats.activeWeapon === 'staff' ? 'WARD' : 'BLOCK'}
            </span>
          </button>
        </div>

        {/* Skill & Heavy column */}
        <div className="flex flex-col gap-2">
          {/* Elemental Skill */}
          <button
            id="btn-vact-skill"
            onPointerDown={handleTouchStart(() => {
              engine.triggerElementSkill();
            })}
            disabled={(engine.stats.elementSkillCooldown || 0) > 0}
            className={`w-11 h-11 rounded-xl border-2 flex flex-col items-center justify-center text-white shadow-md cursor-pointer active:scale-95 transition-transform ${
              (engine.stats.elementSkillCooldown || 0) > 0
                ? 'bg-slate-900 border-slate-700 opacity-60 cursor-not-allowed'
                : engine.stats.activeElement === 'fire'
                ? 'bg-orange-700 active:bg-orange-600 border-orange-400 animate-pulse'
                : engine.stats.activeElement === 'ice'
                ? 'bg-sky-700 active:bg-sky-600 border-sky-400 animate-pulse'
                : 'bg-amber-600 active:bg-amber-500 border-yellow-300 animate-pulse'
            }`}
            title="Keluarkan Skil Elemen Senjata"
          >
            <span className="text-base">✨</span>
            <span className="text-[7px] font-pixel text-yellow-200">
              {(engine.stats.elementSkillCooldown || 0) > 0
                ? `${(engine.stats.elementSkillCooldown || 0).toFixed(0)}s`
                : 'SKILL'}
            </span>
          </button>

          {/* Heavy Attack */}
          <button
            id="btn-vact-heavy"
            onPointerDown={handleTouchStart(() => {
              engine.triggerHeavyAttack();
            })}
            className="w-11 h-11 bg-purple-900 active:bg-purple-700 border-2 border-purple-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md cursor-pointer active:scale-95 transition-transform"
            title="Heavy Attack"
          >
            <span className="text-base">⚡</span>
            <span className="text-[7px] font-pixel text-purple-200">HEAVY</span>
          </button>
        </div>

        {/* Main Attack Button (Big) */}
        <button
          id="btn-vact-attack"
          onPointerDown={handleTouchStart(() => {
            engine.triggerBasicAttack();
          })}
          className="w-16 h-16 bg-red-800 active:bg-red-600 border-3 border-red-400 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg cursor-pointer active:scale-95 transition-transform"
          title="Basic Attack"
        >
          <span className="text-2xl">
            {engine.stats.activeWeapon === 'bow' ? '🏹' : engine.stats.activeWeapon === 'staff' ? '🔮' : '⚔'}
          </span>
          <span className="text-[8px] font-pixel text-red-200 mt-0.5">ATTACK</span>
        </button>
      </div>
    </div>
  );
};
