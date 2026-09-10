import React from 'react';
import { LevelStats } from '../types';
import { Sparkles, Trophy, ShoppingBag, ArrowRight, Home } from 'lucide-react';

interface LevelCompleteModalProps {
  stats: LevelStats;
  currentLevelNumber: number;
  totalCoins: number;
  onNextLevel: () => void;
  onOpenUpgrade: () => void;
  onMainMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  stats,
  currentLevelNumber,
  totalCoins,
  onNextLevel,
  onOpenUpgrade,
  onMainMenu,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-40 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-4 border-amber-500 rounded-2xl w-full max-w-md p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-400 rounded-2xl flex items-center justify-center mb-3 text-amber-400">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-lg sm:text-xl font-pixel text-amber-400 font-bold mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          LEVEL {currentLevelNumber} COMPLETE!
        </h2>
        <p className="text-[10px] font-pixel text-slate-400 mb-6">
          Floor cleared! Arden marches deeper into Drakon's lair.
        </p>

        {/* Stats Summary Card */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 space-y-3 font-pixel text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Enemies Defeated:</span>
            <span className="text-rose-400 font-bold">{stats.enemiesDefeated}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Time Elapsed:</span>
            <span className="text-cyan-400 font-bold">{formatTime(stats.timeSeconds)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Floor Bonus:</span>
            <span className="text-emerald-400 font-bold">+{stats.bonus} 🪙</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 border-t border-slate-800 pt-2">
            <span>Coins Earned:</span>
            <span className="text-amber-400 font-bold">+{stats.coinsEarned} 🪙</span>
          </div>

          <div className="flex justify-between items-center text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-900/50">
            <span>Total Gold:</span>
            <span className="font-extrabold text-sm">{totalCoins} 🪙</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 font-pixel text-[11px]">
          {currentLevelNumber < 30 ? (
            <button
              id="btn-level-next"
              onClick={onNextLevel}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:from-emerald-700 active:to-teal-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95 cursor-pointer border-2 border-emerald-300"
            >
              <span className="text-xs sm:text-sm tracking-wide">LANJUT KE STAGE {currentLevelNumber + 1} ➔</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-level-victory"
              onClick={onNextLevel}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 active:from-amber-600 active:to-rose-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer border-2 border-amber-300"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-xs sm:text-sm tracking-wide">TAMATKAN GAME & SELAMATKAN PUTRI!</span>
            </button>
          )}

          <button
            id="btn-level-upgrade"
            onClick={onOpenUpgrade}
            className="w-full py-2.5 px-4 bg-amber-600/90 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer border border-amber-400"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>UPGRADE SHOP (TEMPA SENJATA & ARMOR)</span>
          </button>

          <button
            id="btn-level-menu"
            onClick={onMainMenu}
            className="w-full py-2 px-4 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>KEMBALI KE MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
