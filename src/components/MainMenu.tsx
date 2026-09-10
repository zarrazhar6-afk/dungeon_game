import React, { useEffect } from 'react';
import { Play, Sparkles, ShoppingBag, BookOpen, Sliders, MapPin, Crown, Compass } from 'lucide-react';
import { audio } from '../game/audio';

interface MainMenuProps {
  hasSave: boolean;
  currentFloor: number;
  highestLevelUnlocked: number;
  coins: number;
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onOpenMapSelect: () => void;
  onOpenUpgrade: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSave,
  currentFloor,
  highestLevelUnlocked,
  coins,
  onStartNewGame,
  onContinueGame,
  onOpenMapSelect,
  onOpenUpgrade,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  useEffect(() => {
    audio.startMusic('menu');
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-black select-none overflow-y-auto min-h-screen sm:min-h-full">
      {/* Background Decorative Castle/Dungeon Archway */}
      <div className="absolute inset-0 opacity-15 pointer-events-none flex justify-between items-center px-12">
        <div className="w-24 h-96 bg-slate-800 border-r-4 border-slate-700 rounded-t-full" />
        <div className="w-24 h-96 bg-slate-800 border-l-4 border-slate-700 rounded-t-full" />
      </div>

      {/* Burning Torches on Left & Right */}
      <div className="absolute top-1/4 left-6 sm:left-16 flex flex-col items-center pointer-events-none">
        <div className="w-4 h-4 rounded-full bg-amber-500 animate-ping opacity-75" />
        <div className="w-3 h-10 bg-amber-900 border-l border-amber-950" />
      </div>
      <div className="absolute top-1/4 right-6 sm:right-16 flex flex-col items-center pointer-events-none">
        <div className="w-4 h-4 rounded-full bg-amber-500 animate-ping opacity-75" />
        <div className="w-3 h-10 bg-amber-900 border-r border-amber-950" />
      </div>

      {/* Main Title Container */}
      <div className="flex flex-col items-center text-center z-10 mb-6 max-w-xl">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-7 h-7 text-amber-400 drop-shadow-md animate-pulse" />
          <span className="text-[11px] font-pixel tracking-widest text-amber-400 uppercase">
            A 2D RETRO ACTION RPG
          </span>
          <Crown className="w-7 h-7 text-amber-400 drop-shadow-md animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-pixel text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 font-extrabold tracking-tight drop-shadow-lg leading-tight mb-2">
          PIXEL DUNGEON
        </h1>
        <h2 className="text-sm sm:text-lg font-pixel text-rose-500 tracking-wider font-bold drop-shadow">
          THE DRAGON'S CROWN & THE THREE WORLDS
        </h2>

        <p className="text-[10px] font-pixel text-slate-400 mt-2 max-w-md leading-relaxed">
          Jelajahi 3 Dunia & 30 Lantai: Kalahkan Goblin di Dragon's Castle, Penyihir di Astral Sanctum, dan Demon Lord Lucifer di Abyssal Inferno!
        </p>

        {/* Currency & Floor pill if save exists */}
        {hasSave && (
          <div className="flex items-center gap-3 mt-3 bg-slate-900/80 border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-pixel text-slate-300">
            <span className="text-cyan-400">Current: Stage {currentFloor}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">Max: Stage {highestLevelUnlocked}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">{coins} 🪙 Gold</span>
          </div>
        )}
      </div>

      {/* Menu Buttons List */}
      <div className="flex flex-col gap-2.5 w-full max-w-xs z-10 font-pixel text-xs">
        {/* Continue if save exists */}
        {hasSave && (
          <button
            id="btn-menu-continue"
            onClick={() => {
              audio.playButtonClick();
              onContinueGame();
            }}
            className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform cursor-pointer border-2 border-emerald-400"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>LANJUTKAN (STAGE {currentFloor})</span>
          </button>
        )}

        {/* Select Map & Stage */}
        <button
          id="btn-menu-map-select"
          onClick={() => {
            audio.playButtonClick();
            onOpenMapSelect();
          }}
          className="py-3 px-6 bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-transform cursor-pointer border-2 border-indigo-400"
        >
          <Compass className="w-4 h-4 text-amber-300" />
          <span>PILIH MAP & STAGE (30 STAGE)</span>
        </button>

        {/* Start Game from stage 1 */}
        <button
          id="btn-menu-start"
          onClick={() => {
            audio.playButtonClick();
            onStartNewGame();
          }}
          className="py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 active:scale-95 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-transform cursor-pointer border-2 border-amber-300"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{hasSave ? 'MULAI DARI STAGE 1' : 'MULAI PETUALANGAN'}</span>
        </button>

        {/* Upgrade Shop */}
        <button
          id="btn-menu-upgrade"
          onClick={() => {
            audio.playButtonClick();
            onOpenUpgrade();
          }}
          className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-200 border-2 border-slate-700 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>UPGRADE SHOP</span>
        </button>

        {/* How to Play */}
        <button
          id="btn-menu-how"
          onClick={() => {
            audio.playButtonClick();
            onOpenHowToPlay();
          }}
          className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-200 border-2 border-slate-700 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>PANDUAN & KONTROL</span>
        </button>

        {/* Settings */}
        <button
          id="btn-menu-settings"
          onClick={() => {
            audio.playButtonClick();
            onOpenSettings();
          }}
          className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-200 border-2 border-slate-700 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>PENGATURAN</span>
        </button>
      </div>

      {/* Footer Version & Credits */}
      <div className="mt-6 text-center text-[8px] font-pixel text-slate-600">
        PIXEL DUNGEON: THE DRAGON'S CROWN • 3 WORLDS & 30 STAGES EDITION
      </div>
    </div>
  );
};
