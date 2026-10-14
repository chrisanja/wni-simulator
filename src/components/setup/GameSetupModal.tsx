import React, { useState } from 'react';
import { Users, Bot, User, Play, Sparkles } from 'lucide-react';

interface PlayerConfig {
  name: string;
  avatar: string;
  color: string;
  isBot: boolean;
}

interface GameSetupModalProps {
  onStartGame: (configs: PlayerConfig[]) => void;
}

const DEFAULT_AVATARS = ['🛵', '🚗', '🚲', '🛴', '🏎️', '🚌'];
const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
const DEFAULT_NAMES = ['Budi Santoso', 'Slamet Kopling', 'Agus Knalpot', 'Joko Ribut'];

export const GameSetupModal: React.FC<GameSetupModalProps> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [configs, setConfigs] = useState<PlayerConfig[]>([
    { name: DEFAULT_NAMES[0], avatar: DEFAULT_AVATARS[0], color: DEFAULT_COLORS[0], isBot: false },
    { name: DEFAULT_NAMES[1], avatar: DEFAULT_AVATARS[1], color: DEFAULT_COLORS[1], isBot: true },
    { name: DEFAULT_NAMES[2], avatar: DEFAULT_AVATARS[2], color: DEFAULT_COLORS[2], isBot: true },
    { name: DEFAULT_NAMES[3], avatar: DEFAULT_AVATARS[3], color: DEFAULT_COLORS[3], isBot: true },
  ]);

  const handleCountChange = (count: number) => {
    setPlayerCount(count);
  };

  const updateConfig = (idx: number, patch: Partial<PlayerConfig>) => {
    setConfigs(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const handleStart = () => {
    onStartGame(configs.slice(0, playerCount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl select-none max-h-[90vh] overflow-y-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulasi Realita Kehidupan +62</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            WNI SIMULATOR
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Atur peserta yang akan bertarung bertahan hidup dari tagihan, tilang, dan bansos!
          </p>
        </div>

        {/* Player Count Selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Jumlah Pemain:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleCountChange(num)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  playerCount === num
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{num} Orang</span>
              </button>
            ))}
          </div>
        </div>

        {/* Player Configurations */}
        <div className="space-y-3 mb-6">
          {Array.from({ length: playerCount }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: configs[idx].color }}
                  />
                  <span>Pemain {idx + 1}</span>
                </span>

                {/* Human vs Bot Toggle */}
                <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => updateConfig(idx, { isBot: false })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                      !configs[idx].isBot
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="w-3 h-3" />
                    <span>Orang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConfig(idx, { isBot: true })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                      configs[idx].isBot
                        ? 'bg-indigo-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bot className="w-3 h-3" />
                    <span>Bot AI</span>
                  </button>
                </div>
              </div>

              {/* Name Input & Avatar Picker */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={configs[idx].name}
                  onChange={e => updateConfig(idx, { name: e.target.value })}
                  placeholder={`Nama Pemain ${idx + 1}`}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />

                {/* Avatar Cycle */}
                <button
                  type="button"
                  title="Ganti Kendaraan / Avatar"
                  onClick={() => {
                    const nextAvatarIdx =
                      (DEFAULT_AVATARS.indexOf(configs[idx].avatar) + 1) % DEFAULT_AVATARS.length;
                    updateConfig(idx, { avatar: DEFAULT_AVATARS[nextAvatarIdx] });
                  }}
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-base hover:border-amber-500 transition-all"
                >
                  {configs[idx].avatar}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>MULAI SIMULASI WNI</span>
        </button>
      </div>
    </div>
  );
};
