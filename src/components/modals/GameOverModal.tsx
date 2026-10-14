import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Player, Tile } from '../../types/game';
import { calculateNetWorth, formatRupiah } from '../../utils/format';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  winner: Player | null;
  tiles: Tile[];
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  tiles,
  onRestart,
}) => {
  useEffect(() => {
    if (winner) {
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if canvas not supported
      }
    }
  }, [winner]);

  if (!winner) return null;

  const totalAssets = calculateNetWorth(winner, tiles);
  const ownedCount = tiles.filter(t => t.ownerId === winner.id).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30 border-2 border-amber-500/50 shadow-2xl text-center select-none">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-slate-100 tracking-wide mb-1">
          WARGA PALING TANGGUH!
        </h2>
        <p className="text-xs text-amber-400 font-semibold mb-4">
          Berhasil Bertahan Hidup Dari Kerasnya Sistem +62
        </p>

        {/* Winner Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 mb-6">
          <div className="flex items-center justify-center gap-2">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md border-2 border-white"
              style={{ backgroundColor: winner.color }}
            >
              {winner.avatar}
            </span>
            <span className="text-xl font-bold text-white">{winner.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
            <div className="bg-slate-900 p-2 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Sisa Kas Tunai</span>
              <span className="font-bold text-emerald-400 text-sm">
                {formatRupiah(winner.cash)}
              </span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Total Kekayaan</span>
              <span className="font-bold text-amber-400 text-sm">
                {formatRupiah(totalAssets)}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Memiliki {ownedCount} aset tanah & properti</span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          <span>Mulai Permainan Baru</span>
        </button>
      </div>
    </div>
  );
};
