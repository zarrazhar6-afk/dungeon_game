import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Trophy, RotateCcw, Home, Heart } from 'lucide-react';
import { audio } from '../game/audio';

interface VictoryModalProps {
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onPlayAgain, onMainMenu }) => {
  const [cutsceneStep, setCutsceneStep] = useState<number>(1);

  useEffect(() => {
    audio.startMusic('victory');
  }, []);

  const storySteps = [
    {
      title: 'THE THREE WORLDS CONQUERED',
      desc: 'Knight Arden has conquered all 30 treacherous stages: slaying the dragon Drakon, shattering the arcane spells of Archmage Morvath, and banishing Demon Lord Lucifer back into the abyss!',
      icon: '⚔️',
      bgColor: 'from-amber-950/60 to-red-950/60',
    },
    {
      title: 'THE ROYAL CELL & SANCTUARY',
      desc: 'With the final demonic seal broken, Knight Arden rushes to the grand gilded cage at the heart of the realm, sundering the chains forever.',
      icon: '✨',
      bgColor: 'from-purple-950/60 to-indigo-950/60',
    },
    {
      title: 'PRINCESS LYRA RESCUED',
      desc: '"Brave Arden, you conquered dragons, wizards, and demons to save me!" Princess Lyra embraces her savior as golden light floods the once dark chambers.',
      icon: '👑',
      bgColor: 'from-rose-950/60 to-pink-950/60',
    },
    {
      title: 'PEACE ACROSS ALL REALMS!',
      desc: 'Together they return to the surface kingdom under clear blue skies, greeted by roaring cheers from the citizens and joyful royal fanfare.',
      icon: '🏰',
      bgColor: 'from-emerald-950/60 to-teal-950/60',
    },
  ];

  const isLastStep = cutsceneStep > storySteps.length;

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-40 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-2xl w-full max-w-lg p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        {!isLastStep ? (
          /* Animated Story Cutscene Sequence */
          <div className="w-full flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-400 rounded-3xl flex items-center justify-center text-4xl mb-4 animate-bounce">
              {storySteps[cutsceneStep - 1].icon}
            </div>

            <div className="text-[9px] font-pixel text-amber-400 mb-1 tracking-widest uppercase">
              CHAPTER {cutsceneStep} OF {storySteps.length}
            </div>

            <h2 className="text-base sm:text-lg font-pixel text-amber-300 font-bold mb-3">
              {storySteps[cutsceneStep - 1].title}
            </h2>

            <div
              className={`w-full bg-gradient-to-br ${
                storySteps[cutsceneStep - 1].bgColor
              } border border-amber-500/30 rounded-xl p-5 mb-6 text-xs font-pixel text-slate-200 leading-relaxed min-h-[100px] flex items-center justify-center`}
            >
              {storySteps[cutsceneStep - 1].desc}
            </div>

            <button
              id="btn-cutscene-next"
              onClick={() => {
                audio.playButtonClick();
                setCutsceneStep((s) => s + 1);
              }}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-pixel font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer text-xs"
            >
              CONTINUE STORY ▶
            </button>
          </div>
        ) : (
          /* Grand Victory Screen */
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-b from-amber-400 to-yellow-600 border-2 border-amber-300 rounded-2xl flex items-center justify-center text-slate-950 mb-3 shadow-lg shadow-amber-500/30">
              <Crown className="w-9 h-9" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-pixel text-rose-400 mb-1">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              PRINCESS RESCUED
            </div>

            <h1 className="text-xl sm:text-2xl font-pixel text-amber-400 font-bold mb-2 tracking-wider">
              THE KINGDOM IS SAVED!
            </h1>

            <p className="text-[10px] font-pixel text-slate-300 mb-5 leading-normal max-w-sm">
              "Knight Arden defeated the mighty Drakon and rescued the princess. Peace reigns once more across the realm."
            </p>

            {/* Victory Rewards Card */}
            <div className="w-full bg-slate-950/80 border-2 border-amber-500/60 rounded-xl p-4 mb-6 space-y-3 font-pixel text-xs">
              <div className="flex justify-between items-center text-slate-200">
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" /> VICTORY BONUS:
                </span>
                <span className="text-amber-400 font-bold">+1000 🪙</span>
              </div>

              <div className="flex justify-between items-center text-slate-200 border-t border-slate-800 pt-2">
                <span className="flex items-center gap-1 text-red-400">
                  <Sparkles className="w-4 h-4" /> WEAPON REWARD:
                </span>
                <span className="text-red-400 font-bold">DRAGON SLAYER UNLOCKED!</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5 font-pixel text-[11px]">
              <button
                id="btn-victory-replay"
                onClick={onPlayAgain}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PLAY AGAIN</span>
              </button>

              <button
                id="btn-victory-menu"
                onClick={onMainMenu}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>MAIN MENU</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
