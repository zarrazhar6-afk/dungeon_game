import React from 'react';
import { ArrowLeft, BookOpen, Shield, Zap, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/95 z-40 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-4 border-slate-700 rounded-2xl w-full max-w-lg p-6 flex flex-col max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-how-back"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-pixel text-amber-400 font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400 inline" /> HOW TO PLAY
              </h2>
              <p className="text-[10px] font-pixel text-slate-400">Knight Arden's Survival Codex</p>
            </div>
          </div>
        </div>

        {/* Story & Mission Objective */}
        <div className="bg-slate-950 border border-amber-900/40 p-3 rounded-xl mb-4 font-pixel text-xs text-amber-200/90 leading-relaxed">
          <span className="text-amber-400 font-bold block mb-1">⚔ MISSION OBJECTIVE:</span>
          "Explore the dungeon floors, defeat goblin scouts, collect coins from chests, upgrade your weapons and armor at the blacksmith, slay the dragon Drakon, and rescue Princess Lyra!"
        </div>

        {/* Desktop Controls Guide */}
        <div className="space-y-3 mb-4 font-pixel text-xs">
          <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">
            KEYBOARD CONTROLS (DESKTOP)
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Move Left/Right</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">A / D or ◀ ▶</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Jump</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">W or ▲</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Basic Attack</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">SPACE or J</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Heavy Attack</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">K or X</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Dash (i-Frames)</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">SHIFT or L</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Block with Shield</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">HOLD E or C</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Health Potion</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-rose-300">Q</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Interact / Open</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">E</span>
            </div>
          </div>
        </div>

        {/* Mobile Touch Controls Guide */}
        <div className="space-y-2 mb-4 font-pixel text-xs">
          <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">
            MOBILE CONTROLS
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1.5">
            <p>• Left side: Touch D-Pad to move left/right and leap over hazards.</p>
            <p>• Right side: Attack (⚔), Heavy Strike (⚡), Dash (💨), Shield Block (🛡), and Open Chests (🖐).</p>
          </div>
        </div>

        {/* Combat Tips */}
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl mb-6 font-pixel text-[9px] text-slate-400 space-y-1">
          <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> PRO TACTICS:
          </div>
          <p>• Shield block negates up to 50% damage when held during enemy swings.</p>
          <p>• Dashing grants invulnerability frames to pass through arrows and fireballs.</p>
          <p>• Upgrade your armor and weapon before attempting Floor 4 and Floor 5!</p>
        </div>

        <button
          id="btn-how-return"
          onClick={onClose}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-600 rounded-xl font-pixel text-xs transition-colors cursor-pointer"
        >
          RETURN
        </button>
      </div>
    </div>
  );
};
