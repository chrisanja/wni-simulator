import type { Player, Tile } from '../../types/game';
import { formatRupiah } from '../../utils/format';
import { Building2, Home, X } from 'lucide-react';

interface PropertyActionModalProps {
  tile: Tile | null;
  player: Player;
  onBuy: () => void;
  onPass: () => void;
  isBotTurn: boolean;
}

export const PropertyActionModal: React.FC<PropertyActionModalProps> = ({
  tile,
  player,
  onBuy,
  onPass,
  isBotTurn,
}) => {
  if (!tile || tile.type !== 'PROPERTY' || tile.ownerId) return null;

  const canAfford = tile.price ? player.cash >= tile.price : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl select-none">
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{tile.name}</h2>
            {tile.subtitle && (
              <p className="text-xs text-slate-400">{tile.subtitle}</p>
            )}
          </div>
        </div>

        {/* Price Tag & Player Cash */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Harga Tanah:</span>
            <span className="font-extrabold text-amber-400 text-base">
              {formatRupiah(tile.price || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-2">
            <span className="text-slate-400">Uang Kas Kamu:</span>
            <span
              className={`font-semibold ${
                canAfford ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatRupiah(player.cash)}
            </span>
          </div>
        </div>

        {/* Rent Schedule Table */}
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 mb-6 text-xs">
          <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Potensi Uang Sewa Dari Lawan:</span>
          </div>
          <div className="space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Tanah Kosong:</span>
              <span className="font-medium text-slate-200">
                {formatRupiah(tile.baseRent || 0)}
              </span>
            </div>
            {tile.houseRents?.map((rent, i) => (
              <div key={i} className="flex justify-between">
                <span>Rumah Tingkat {i + 1}:</span>
                <span className="font-medium text-slate-200">
                  {formatRupiah(rent)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPass}
            disabled={isBotTurn}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <X className="w-4 h-4" />
            <span>Lewati Saja</span>
          </button>

          <button
            onClick={onBuy}
            disabled={!canAfford || isBotTurn}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all shadow-lg ${
              canAfford && !isBotTurn
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-98'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{canAfford ? 'Beli Tanah' : 'Uang Kurang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
