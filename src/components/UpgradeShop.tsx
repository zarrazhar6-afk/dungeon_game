import React, { useState } from 'react';
import { UpgradeLevels, GameSaveData } from '../types';
import { SWORD_UPGRADES, ARMOR_UPGRADES, HEALTH_UPGRADES, SHIELD_UPGRADES } from '../game/constants';
import { audio } from '../game/audio';
import { Shield, Zap, Heart, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface UpgradeShopProps {
  saveData: GameSaveData;
  onSaveDataChange: (newSave: GameSaveData) => void;
  onClose: () => void;
}

export const UpgradeShop: React.FC<UpgradeShopProps> = ({
  saveData,
  onSaveDataChange,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'sword' | 'armor' | 'health' | 'shield'>('sword');

  const handleBuyUpgrade = (category: keyof UpgradeLevels) => {
    const currentLvl = saveData.upgrades[category];
    if (currentLvl >= 10) return;

    let nextTier;
    if (category === 'sword') nextTier = SWORD_UPGRADES[currentLvl];
    else if (category === 'armor') nextTier = ARMOR_UPGRADES[currentLvl];
    else if (category === 'health') nextTier = HEALTH_UPGRADES[currentLvl];
    else nextTier = SHIELD_UPGRADES[currentLvl];

    if (!nextTier || saveData.coins < nextTier.cost) {
      audio.playBlock();
      return;
    }

    audio.playUpgrade();
    const newSave: GameSaveData = {
      ...saveData,
      coins: saveData.coins - nextTier.cost,
      upgrades: {
        ...saveData.upgrades,
        [category]: currentLvl + 1,
      },
    };
    onSaveDataChange(newSave);
  };

  const handleBuyPotion = () => {
    const cost = 40;
    if (saveData.potions >= 3 || saveData.coins < cost) {
      audio.playBlock();
      return;
    }
    audio.playPotion();
    const newSave: GameSaveData = {
      ...saveData,
      coins: saveData.coins - cost,
      potions: saveData.potions + 1,
    };
    onSaveDataChange(newSave);
  };

  const currentTierData =
    activeTab === 'sword'
      ? SWORD_UPGRADES
      : activeTab === 'armor'
      ? ARMOR_UPGRADES
      : activeTab === 'health'
      ? HEALTH_UPGRADES
      : SHIELD_UPGRADES;

  const currentLevel = saveData.upgrades[activeTab];

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-40 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-4 border-amber-600/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="btn-shop-back"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-pixel text-amber-400 font-bold tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 inline" /> BLACKSMITH & UPGRADES
              </h2>
              <p className="text-[10px] font-pixel text-slate-400">
                Enhance your armaments with gold to survive Drakon
              </p>
            </div>
          </div>

          {/* Current Gold & Potions */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-amber-500/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="text-base">🪙</span>
              <span className="text-xs font-pixel text-amber-300 font-bold">{saveData.coins}</span>
            </div>

            <div className="bg-slate-900 border border-rose-500/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="text-base">🧪</span>
              <span className="text-xs font-pixel text-rose-300 font-bold">{saveData.potions}/3</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-4 bg-slate-950/60 border-b border-slate-800 text-xs font-pixel">
          <button
            id="tab-shop-sword"
            onClick={() => setActiveTab('sword')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sword'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="text-[9px]">SWORD (Lv.{saveData.upgrades.sword})</span>
          </button>

          <button
            id="tab-shop-armor"
            onClick={() => setActiveTab('armor')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'armor'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-[9px]">ARMOR (Lv.{saveData.upgrades.armor})</span>
          </button>

          <button
            id="tab-shop-health"
            onClick={() => setActiveTab('health')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'health'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span className="text-[9px]">HEALTH (Lv.{saveData.upgrades.health})</span>
          </button>

          <button
            id="tab-shop-shield"
            onClick={() => setActiveTab('shield')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'shield'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-sky-400" />
            <span className="text-[9px]">SHIELD (Lv.{saveData.upgrades.shield})</span>
          </button>
        </div>

        {/* Upgrade Tiers List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentTierData.map((tier) => {
            const isUnlocked = currentLevel >= tier.level;
            const isNext = currentLevel + 1 === tier.level;
            const canAfford = saveData.coins >= tier.cost;

            return (
              <div
                key={tier.level}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isUnlocked
                    ? 'bg-slate-800/60 border-emerald-500/60'
                    : isNext
                    ? 'bg-slate-800 border-amber-500/80 shadow-md'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-pixel text-sm font-bold text-white shrink-0 border border-white/20"
                    style={{ backgroundColor: tier.color }}
                  >
                    {tier.level}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-pixel text-slate-100 font-bold">{tier.name}</span>
                      {tier.level === 5 && (
                        <span className="bg-amber-600/80 text-white text-[8px] font-pixel px-1.5 py-0.5 rounded">
                          LEGENDARY
                        </span>
                      )}
                      {tier.level === 8 && (
                        <span className="bg-purple-600/80 text-white text-[8px] font-pixel px-1.5 py-0.5 rounded">
                          MYTHIC
                        </span>
                      )}
                      {tier.level === 10 && (
                        <span className="bg-gradient-to-r from-rose-500 to-amber-400 text-slate-950 font-extrabold text-[8px] font-pixel px-1.5 py-0.5 rounded">
                          OMEGA MAX
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] font-pixel text-slate-400 mt-1">{tier.description}</p>
                    <div className="text-[9px] font-pixel text-amber-400 mt-1">
                      {activeTab === 'sword' && `Attack: +${tier.statBonus}`}
                      {activeTab === 'armor' && `Defense: +${tier.statBonus}`}
                      {activeTab === 'health' && `Max HP: ${tier.statBonus}`}
                      {activeTab === 'shield' && `Block: ${tier.statBonus}% Damage`}
                    </div>
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <div className="flex items-center gap-1 text-emerald-400 font-pixel text-[10px] bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700">
                      <Check className="w-3.5 h-3.5" /> EQUIPPED
                    </div>
                  ) : isNext ? (
                    <button
                      id={`btn-buy-${activeTab}-${tier.level}`}
                      onClick={() => handleBuyUpgrade(activeTab)}
                      disabled={!canAfford}
                      className={`px-3 py-2 rounded-lg font-pixel text-[10px] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <span>UPGRADE</span>
                      <span className="text-amber-950 font-extrabold">{tier.cost} 🪙</span>
                    </button>
                  ) : (
                    <div className="text-slate-600 font-pixel text-[9px] px-3 py-1">
                      LOCKED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Potion Restock Station & Close */}
        <div className="bg-slate-950 border-t border-slate-800 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-pixel text-slate-300">ALCHEMIST:</span>
            <button
              id="btn-shop-buy-potion"
              onClick={handleBuyPotion}
              disabled={saveData.potions >= 3 || saveData.coins < 40}
              className={`px-3 py-1.5 rounded border text-[9px] font-pixel flex items-center gap-1.5 cursor-pointer ${
                saveData.potions < 3 && saveData.coins >= 40
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300 hover:bg-rose-900 active:scale-95'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>🧪 BUY POTION (40 🪙)</span>
              <span className="text-rose-400 font-bold">({saveData.potions}/3)</span>
            </button>
          </div>

          <button
            id="btn-shop-done"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg font-pixel text-[10px] cursor-pointer"
          >
            RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
