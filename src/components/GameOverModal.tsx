import React from 'react';
import { Skull, RotateCcw, Home, ShoppingBag } from 'lucide-react';

interface GameOverModalProps {
  enemiesDefeated: number;
  coinsCollected: number;
  onRetry: () => void;
  onOpenUpgrade: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  enemiesDefeated,
  coinsCollected,
  onRetry,
  onOpenUpgrade,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 bg-red-950/90 z-40 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-4 border-red-700 rounded-2xl w-full max-w-md p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        {/* Skull Icon */}
        <div className="w-16 h-16 bg-red-900/40 border-2 border-red-600 rounded-2xl flex items-center justify-center mb-3 text-red-500 animate-pulse">
          <Skull className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-pixel text-red-500 font-bold mb-2 tracking-wider drop-shadow-md">
          YOU DIED
        </h1>
        <p className="text-xs font-pixel text-slate-400 mb-6 italic">
          "Your journey ends here..."
        </p>

        {/* Stats card */}
        <div className="w-full bg-slate-950/80 border border-red-900/60 rounded-xl p-4 mb-6 space-y-3 font-pixel text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Enemies Defeated:</span>
            <span className="text-rose-400 font-bold">{enemiesDefeated}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Coins Collected:</span>
            <span className="text-amber-400 font-bold">+{coinsCollected} 🪙</span>
          </div>

          <p className="text-[9px] text-slate-500 border-t border-slate-800 pt-2 text-left">
            * All purchased upgrades & saved coins are preserved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 font-pixel text-[11px]">
          <button
            id="btn-gameover-retry"
            onClick={onRetry}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY FLOOR</span>
          </button>

          <button
            id="btn-gameover-upgrade"
            onClick={onOpenUpgrade}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>UPGRADE SHOP</span>
          </button>

          <button
            id="btn-gameover-menu"
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
