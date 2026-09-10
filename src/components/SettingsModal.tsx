import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowLeft, Sliders, Monitor, RotateCcw } from 'lucide-react';
import { audio } from '../game/audio';

interface SettingsModalProps {
  crtEnabled: boolean;
  onToggleCrt: (enabled: boolean) => void;
  virtualControlsEnabled: boolean;
  onToggleVirtualControls: (enabled: boolean) => void;
  onClearSaveData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  crtEnabled,
  onToggleCrt,
  virtualControlsEnabled,
  onToggleVirtualControls,
  onClearSaveData,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(audio.getMuted());
  const [volumes, setVolumes] = useState(audio.getVolumes());
  const [confirmReset, setConfirmReset] = useState(false);

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    audio.setMute(next);
  };

  const handleVolumeChange = (sfx: number, music: number) => {
    setVolumes({ sfx, music });
    audio.setVolume(sfx, music);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-40 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-4 border-slate-700 rounded-2xl w-full max-w-md p-6 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-settings-back"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-pixel text-amber-400 font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400 inline" /> SETTINGS
              </h2>
              <p className="text-[10px] font-pixel text-slate-400">Audio & Visual Preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6 font-pixel text-xs">
          {/* Audio Mute Toggle */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200">
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>MUTE AUDIO</span>
            </div>
            <button
              id="btn-settings-mute"
              onClick={handleMuteToggle}
              className={`px-3 py-1.5 rounded text-[10px] font-pixel font-bold transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isMuted ? 'MUTED' : 'ACTIVE'}
            </button>
          </div>

          {/* SFX Volume Slider */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-300 text-[10px]">
              <span>SOUND EFFECTS</span>
              <span className="text-amber-400">{Math.round(volumes.sfx * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volumes.sfx}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value), volumes.music)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Music Volume Slider */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-300 text-[10px]">
              <span>CHIPTUNE MUSIC</span>
              <span className="text-amber-400">{Math.round(volumes.music * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volumes.music}
              onChange={(e) => handleVolumeChange(volumes.sfx, parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* CRT Scanlines Effect Toggle */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>RETRO CRT SCANLINES</span>
            </div>
            <button
              id="btn-settings-crt"
              onClick={() => onToggleCrt(!crtEnabled)}
              className={`px-3 py-1.5 rounded text-[10px] font-pixel font-bold transition-colors cursor-pointer ${
                crtEnabled
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {crtEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Mobile Touch Controls On-Screen Toggle */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="text-slate-200">
              <span>TOUCH CONTROLS</span>
            </div>
            <button
              id="btn-settings-vcontrols"
              onClick={() => onToggleVirtualControls(!virtualControlsEnabled)}
              className={`px-3 py-1.5 rounded text-[10px] font-pixel font-bold transition-colors cursor-pointer ${
                virtualControlsEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {virtualControlsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Reset Save Data */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-red-900/40 flex items-center justify-between">
            <span className="text-slate-400 text-[10px]">RESET PROGRESS</span>
            {!confirmReset ? (
              <button
                id="btn-settings-reset"
                onClick={() => setConfirmReset(true)}
                className="px-2.5 py-1 bg-red-950/60 border border-red-800 text-red-400 hover:bg-red-900 text-[9px] rounded cursor-pointer"
              >
                RESET
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onClearSaveData();
                    setConfirmReset(false);
                  }}
                  className="px-2 py-1 bg-red-600 text-white text-[9px] rounded font-bold cursor-pointer"
                >
                  CONFIRM
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 bg-slate-800 text-slate-300 text-[9px] rounded cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          id="btn-settings-done"
          onClick={onClose}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-600 rounded-xl font-pixel text-xs transition-colors cursor-pointer"
        >
          RETURN
        </button>
      </div>
    </div>
  );
};
