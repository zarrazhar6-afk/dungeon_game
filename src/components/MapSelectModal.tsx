import React, { useState } from 'react';
import { WORLD_DEFINITIONS, WorldInfo } from '../types';
import { LEVELS } from '../game/levels';
import { X, Lock, CheckCircle, Skull, Sparkles, ChevronRight, Play } from 'lucide-react';

interface MapSelectModalProps {
  highestLevelUnlocked: number;
  currentLevel: number;
  onSelectLevel: (levelIndex: number) => void;
  onClose: () => void;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({
  highestLevelUnlocked,
  currentLevel,
  onSelectLevel,
  onClose,
}) => {
  // Determine which world tab to focus on initially
  const initialWorldId = highestLevelUnlocked > 20 ? 3 : highestLevelUnlocked > 10 ? 2 : 1;
  const [selectedWorldId, setSelectedWorldId] = useState<number>(initialWorldId);

  const selectedWorld = WORLD_DEFINITIONS.find((w) => w.id === selectedWorldId) || WORLD_DEFINITIONS[0];

  const isWorldUnlocked = (world: WorldInfo) => {
    return highestLevelUnlocked >= world.minLevel;
  };

  const worldLevels = LEVELS.filter(
    (l) => l.config.id >= selectedWorld.minLevel && l.config.id <= selectedWorld.maxLevel
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-slate-950 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <h2 className="text-sm sm:text-base font-pixel font-bold text-amber-400 tracking-wider">
                DUNGEON EXPEDITION MAP
              </h2>
              <p className="text-[10px] font-pixel text-slate-400">
                Pilih Dunia dan Stage yang telah kamu jelajahi (Total 30 Stages)
              </p>
            </div>
          </div>
          <button
            id="btn-close-map-select"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* World Selection Tabs */}
        <div className="grid grid-cols-3 p-3 gap-2 bg-slate-900/50 border-b border-slate-800">
          {WORLD_DEFINITIONS.map((world) => {
            const unlocked = isWorldUnlocked(world);
            const isSelected = selectedWorldId === world.id;

            return (
              <button
                key={world.id}
                id={`btn-world-tab-${world.id}`}
                onClick={() => {
                  if (unlocked) setSelectedWorldId(world.id);
                }}
                disabled={!unlocked}
                className={`flex flex-col p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-950/20'
                    : unlocked
                    ? 'border-slate-700 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60'
                    : 'border-slate-800/60 bg-slate-950/60 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs sm:text-sm font-pixel font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{world.icon}</span>
                    <span className="truncate">{world.name}</span>
                  </span>
                  {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                </div>

                <div className="flex items-center justify-between text-[9px] font-pixel">
                  <span className="text-slate-400">{world.subTitle}</span>
                  <span className="text-amber-300 font-semibold">
                    Stage {world.minLevel}–{world.maxLevel}
                  </span>
                </div>

                {/* Boss indicator */}
                <div className="mt-1 flex items-center gap-1 text-[8px] font-pixel text-red-400">
                  <Skull className="w-2.5 h-2.5" />
                  <span className="truncate">Boss: {world.bossName}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active World Banner & Description */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedWorld.icon}</span>
            <div>
              <div className="text-xs font-pixel font-bold text-amber-300">
                {selectedWorld.name} — {selectedWorld.subTitle}
              </div>
              <div className="text-[10px] font-pixel text-slate-400">
                {selectedWorld.description}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-red-950/60 border border-red-800/60 px-2.5 py-1 rounded-lg text-[9px] font-pixel text-red-300">
            <Skull className="w-3.5 h-3.5 text-red-400" />
            <span>Boss: {selectedWorld.bossName}</span>
          </div>
        </div>

        {/* Stage Grid (10 Stages for this world) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {worldLevels.map((lvl) => {
            const isUnlocked = highestLevelUnlocked >= lvl.config.id;
            const isCleared = highestLevelUnlocked > lvl.config.id;
            const isCurrent = currentLevel === lvl.config.id;
            const isBossStage = lvl.config.id % 10 === 0;

            return (
              <div
                key={lvl.config.id}
                id={`card-stage-${lvl.config.id}`}
                className={`relative flex flex-col justify-between p-3 rounded-xl border transition-all ${
                  isBossStage
                    ? isUnlocked
                      ? 'border-red-600 bg-red-950/40 shadow-lg shadow-red-950/30'
                      : 'border-red-950/60 bg-slate-950/80 opacity-60'
                    : isCurrent
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-md shadow-cyan-950/20'
                    : isUnlocked
                    ? 'border-slate-700 bg-slate-900/80 hover:border-amber-500/80 hover:bg-slate-850'
                    : 'border-slate-800/60 bg-slate-950/60 opacity-40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-pixel font-bold px-1.5 py-0.5 rounded ${
                        isBossStage
                          ? 'bg-red-900/80 text-red-200'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      STAGE {lvl.config.id}
                    </span>

                    {isCleared ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : isUnlocked ? (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>

                  <div className="text-[11px] font-pixel font-bold text-slate-200 leading-tight mb-1 truncate">
                    {lvl.config.name}
                  </div>

                  <div className="text-[9px] font-pixel text-slate-400 mb-2 truncate">
                    {lvl.config.subName}
                  </div>

                  <div className="flex items-center gap-1 text-[8px] font-pixel text-amber-400/90 mb-3">
                    <span>🪙 +{lvl.config.rewardBase}</span>
                    <span>•</span>
                    <span className="text-slate-400">{lvl.enemies.length} Musuh</span>
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    id={`btn-play-stage-${lvl.config.id}`}
                    onClick={() => onSelectLevel(lvl.config.id - 1)}
                    className={`w-full py-1.5 px-2 rounded-lg font-pixel text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isBossStage
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                        : isCurrent
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>MAIN</span>
                  </button>
                ) : (
                  <div className="w-full py-1.5 text-center font-pixel text-[9px] text-slate-500 bg-slate-900/50 rounded-lg">
                    Terkunci
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-[10px] font-pixel text-slate-400 flex items-center gap-1.5">
            <span>Highest Level Unlocked:</span>
            <span className="text-amber-400 font-bold">Stage {highestLevelUnlocked}</span>
          </div>

          <button
            id="btn-map-select-close"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-[10px] rounded-lg cursor-pointer transition-colors"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
