import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameSaveData, LevelStats } from './types';
import { loadGameSave, saveGameData, hasExistingSave, clearGameSave } from './game/storage';
import { GameEngine } from './game/engine';
import { audio } from './game/audio';
import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { VirtualControls } from './components/VirtualControls';
import { UpgradeShop } from './components/UpgradeShop';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { MapSelectModal } from './components/MapSelectModal';
import { Play, Home, ShoppingBag, Compass } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameSave());
  const [hasSave, setHasSave] = useState<boolean>(() => hasExistingSave());
  const [levelStats, setLevelStats] = useState<LevelStats | null>(null);
  const [gameOverStats, setGameOverStats] = useState<{ enemiesDefeated: number; coinsCollected: number } | null>(null);

  // Display Settings
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [virtualControlsEnabled, setVirtualControlsEnabled] = useState<boolean>(() => {
    // Auto enable if touch is supported or mobile user-agent
    return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  });

  // Engine & Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Trigger state refresh from engine stats changes
  const [, setTick] = useState<number>(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const saveDataRef = useRef<GameSaveData>(saveData);
  saveDataRef.current = saveData;

  // Track where the Upgrade Shop was opened from so returning always goes to the correct screen
  const shopReturnStateRef = useRef<GameState>('menu');
  const openUpgradeShop = (fromState: GameState) => {
    shopReturnStateRef.current = fromState;
    setGameState('upgrade_shop');
  };

  // Save data sync
  const updateSaveData = (newData: GameSaveData) => {
    saveDataRef.current = newData;
    setSaveData(newData);
    saveGameData(newData);
    setHasSave(hasExistingSave());
    if (engineRef.current) {
      engineRef.current.updateUpgrades(newData.upgrades);
      engineRef.current.stats.coins = newData.coins;
      engineRef.current.stats.potions = newData.potions;
      forceUpdate();
    }
  };

  // Start Level
  const startLevel = (floorIndex: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Ensure canvas dimensions match container
    if (containerRef.current) {
      canvas.width = containerRef.current.clientWidth || window.innerWidth || 800;
      canvas.height = containerRef.current.clientHeight || window.innerHeight || 600;
    }

    // Always fetch latest authoritative save data from storage
    const currentSave = loadGameSave();
    saveDataRef.current = currentSave;
    setSaveData(currentSave);

    // Keep currently active weapon and element if player already selected one
    const activeWeapon = engineRef.current?.stats.activeWeapon || 'sword';
    const activeElement = engineRef.current?.stats.activeElement || 'fire';

    // Create or reuse engine with full upgraded stats
    const engine = new GameEngine(
      canvas,
      floorIndex,
      currentSave.upgrades,
      currentSave.coins,
      currentSave.potions,
      activeWeapon,
      activeElement
    );

    engine.onStatsChanged = () => {
      forceUpdate();
    };

    engine.onLevelComplete = (stats) => {
      // Re-read latest save data to avoid any stale closure
      const latestSave = loadGameSave();
      const nextLevel = Math.min(30, floorIndex + 2); // 1-indexed next level

      const updatedSave: GameSaveData = {
        ...latestSave,
        // Crucial: preserve and keep all purchased upgrades
        upgrades: {
          sword: Math.max(latestSave.upgrades?.sword || 1, engine.upgrades?.sword || 1),
          armor: Math.max(latestSave.upgrades?.armor || 1, engine.upgrades?.armor || 1),
          health: Math.max(latestSave.upgrades?.health || 1, engine.upgrades?.health || 1),
          shield: Math.max(latestSave.upgrades?.shield || 1, engine.upgrades?.shield || 1),
        },
        currentLevel: nextLevel,
        highestLevelUnlocked: Math.max(latestSave.highestLevelUnlocked || 1, nextLevel),
        coins: engine.stats.coins,
        potions: engine.stats.potions,
      };
      updateSaveData(updatedSave);

      // If beaten final boss Lucifer at level 30
      if (floorIndex + 1 >= 30) {
        engine.onVictory?.();
        return;
      }

      setLevelStats(stats);
      setGameState('level_complete');
    };

    engine.onGameOver = (stats) => {
      // Re-read latest save data to avoid stale closure
      const latestSave = loadGameSave();
      const updatedSave: GameSaveData = {
        ...latestSave,
        // Crucial: preserve all purchased upgrades on game over
        upgrades: {
          sword: Math.max(latestSave.upgrades?.sword || 1, engine.upgrades?.sword || 1),
          armor: Math.max(latestSave.upgrades?.armor || 1, engine.upgrades?.armor || 1),
          health: Math.max(latestSave.upgrades?.health || 1, engine.upgrades?.health || 1),
          shield: Math.max(latestSave.upgrades?.shield || 1, engine.upgrades?.shield || 1),
        },
        coins: engine.stats.coins,
      };
      updateSaveData(updatedSave);

      setGameOverStats(stats);
      setGameState('game_over');
    };

    engine.onVictory = () => {
      // Slayed Lucifer and restored peace to all 3 realms!
      const latestSave = loadGameSave();
      const updatedSave: GameSaveData = {
        ...latestSave,
        coins: engine.stats.coins + 2000,
        unlockedDragonSlayer: true,
        gameBeaten: true,
        upgrades: {
          ...latestSave.upgrades,
          // Never downgrade sword if already level 6-10
          sword: Math.max(latestSave.upgrades?.sword || 1, 5),
        },
      };
      updateSaveData(updatedSave);
      setGameState('cutscene_victory');
    };

    engine.isRunning = true;
    engineRef.current = engine;
    lastTimeRef.current = performance.now();
    setGameState('playing');
    forceUpdate();
  };

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        if (engineRef.current) {
          engineRef.current.ctx.imageSmoothingEnabled = false;
        }
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Main Loop
  useEffect(() => {
    const loop = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (engineRef.current && gameState === 'playing' && !engineRef.current.isPaused) {
        engineRef.current.update(dt);
        engineRef.current.render();
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gameState]);

  // Keyboard Event Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling from arrow keys / space
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      if (engineRef.current && gameState === 'playing') {
        engineRef.current.handleKeyDown(e.key);
        forceUpdate();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current && gameState === 'playing') {
        engineRef.current.handleKeyUp(e.key);
      }
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameState, forceUpdate]);

  const engine = engineRef.current;

  return (
    <div
      id="pixel-dungeon-root"
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden bg-slate-950 font-pixel select-none"
    >
      {/* 2D HTML5 Canvas for the Game */}
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pixelated z-0"
      />

      {/* Optional Retro CRT scanlines overlay */}
      {crtEnabled && <div className="scanlines absolute inset-0 z-10 pointer-events-none" />}

      {/* --- IN-GAME HUD & VIRTUAL CONTROLS --- */}
      {gameState === 'playing' && engine && (
        <>
          <GameHUD
            stats={engine.stats}
            upgrades={engine.upgrades}
            levelName={engine.currentLevel.config.name}
            levelNumber={engine.currentLevel.config.id}
            dragonBoss={engine.dragonBoss}
            isPaused={engine.isPaused}
            onTogglePause={() => {
              engine.isPaused = !engine.isPaused;
              forceUpdate();
            }}
            onUsePotion={() => {
              engine.usePotion();
              forceUpdate();
            }}
            onSwitchWeapon={(w) => {
              engine.switchWeapon(w);
              forceUpdate();
            }}
            onSwitchElement={(el) => {
              engine.switchElement(el);
              forceUpdate();
            }}
            onTriggerSkill={() => {
              engine.triggerElementSkill();
              forceUpdate();
            }}
          />

          <VirtualControls
            engine={engine}
            enabled={virtualControlsEnabled}
          />

          {/* Pause Modal Overlay */}
          {engine.isPaused && (
            <div className="fixed inset-0 bg-slate-950/80 z-30 flex items-center justify-center p-4">
              <div className="bg-slate-900 border-4 border-slate-700 rounded-2xl w-full max-w-xs p-6 flex flex-col items-center text-center shadow-2xl space-y-4">
                <h2 className="text-base font-pixel text-amber-400 font-bold">GAME PAUSED</h2>

                <button
                  id="btn-pause-resume"
                  onClick={() => {
                    engine.isPaused = false;
                    forceUpdate();
                  }}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 font-pixel text-xs cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>RESUME</span>
                </button>

                <button
                  id="btn-pause-map-select"
                  onClick={() => {
                    engine.isRunning = false;
                    audio.stopMusic();
                    setGameState('map_select');
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 rounded-xl flex items-center justify-center gap-2 font-pixel text-xs cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-amber-300" />
                  <span>PILIH MAP & STAGE</span>
                </button>

                <button
                  id="btn-pause-shop"
                  onClick={() => openUpgradeShop('playing')}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl flex items-center justify-center gap-2 font-pixel text-xs cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>UPGRADE SHOP</span>
                </button>

                <button
                  id="btn-pause-menu"
                  onClick={() => {
                    engine.isRunning = false;
                    audio.stopMusic();
                    setGameState('menu');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl flex items-center justify-center gap-2 font-pixel text-xs cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>MAIN MENU</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- MAIN MENU --- */}
      {gameState === 'menu' && (
        <MainMenu
          hasSave={hasSave}
          currentFloor={saveData.currentLevel}
          highestLevelUnlocked={saveData.highestLevelUnlocked}
          coins={saveData.coins}
          onStartNewGame={() => startLevel(0)}
          onContinueGame={() => startLevel(saveData.currentLevel - 1)}
          onOpenMapSelect={() => setGameState('map_select')}
          onOpenUpgrade={() => openUpgradeShop('menu')}
          onOpenHowToPlay={() => setGameState('how_to_play')}
          onOpenSettings={() => setGameState('settings')}
        />
      )}

      {/* --- MAP & STAGE SELECT MODAL --- */}
      {gameState === 'map_select' && (
        <MapSelectModal
          currentFloor={saveData.currentLevel}
          highestLevelUnlocked={saveData.highestLevelUnlocked}
          coins={saveData.coins}
          onSelectLevel={(levelNumber) => {
            startLevel(levelNumber - 1);
          }}
          onClose={() => {
            if (engineRef.current && engineRef.current.stats.hp > 0 && engineRef.current.isRunning) {
              setGameState('playing');
            } else {
              setGameState('menu');
            }
          }}
        />
      )}

      {/* --- UPGRADE SHOP MODAL --- */}
      {gameState === 'upgrade_shop' && (
        <UpgradeShop
          saveData={saveData}
          onSaveDataChange={updateSaveData}
          onClose={() => {
            setGameState(shopReturnStateRef.current);
          }}
        />
      )}

      {/* --- LEVEL COMPLETE MODAL --- */}
      {gameState === 'level_complete' && levelStats && (
        <LevelCompleteModal
          stats={levelStats}
          currentLevelNumber={engine ? engine.currentLevel.config.id : 1}
          totalCoins={saveData.coins}
          onNextLevel={() => {
            const nextIdx = (engine ? engine.currentLevelIndex : 0) + 1;
            if (nextIdx >= 30) {
              engine?.onVictory?.();
            } else {
              startLevel(nextIdx);
            }
          }}
          onOpenUpgrade={() => openUpgradeShop('level_complete')}
          onMainMenu={() => setGameState('menu')}
        />
      )}

      {/* --- GAME OVER MODAL --- */}
      {gameState === 'game_over' && gameOverStats && (
        <GameOverModal
          enemiesDefeated={gameOverStats.enemiesDefeated}
          coinsCollected={gameOverStats.coinsCollected}
          onRetry={() => {
            const currentIdx = engine ? engine.currentLevelIndex : 0;
            startLevel(currentIdx);
          }}
          onOpenUpgrade={() => openUpgradeShop('game_over')}
          onMainMenu={() => setGameState('menu')}
        />
      )}

      {/* --- VICTORY MODAL & ENDING CUTSCENE --- */}
      {gameState === 'cutscene_victory' && (
        <VictoryModal
          onPlayAgain={() => startLevel(0)}
          onMainMenu={() => setGameState('menu')}
        />
      )}

      {/* --- HOW TO PLAY MODAL --- */}
      {gameState === 'how_to_play' && (
        <HowToPlayModal onClose={() => setGameState('menu')} />
      )}

      {/* --- SETTINGS MODAL --- */}
      {gameState === 'settings' && (
        <SettingsModal
          crtEnabled={crtEnabled}
          onToggleCrt={setCrtEnabled}
          virtualControlsEnabled={virtualControlsEnabled}
          onToggleVirtualControls={setVirtualControlsEnabled}
          onClearSaveData={() => {
            clearGameSave();
            setSaveData(loadGameSave());
            setHasSave(false);
          }}
          onClose={() => setGameState('menu')}
        />
      )}
    </div>
  );
}
