import type { Player, Tile } from '../../types/game';
import { formatRupiah } from '../../utils/format';
import { Building2, Home, X, Wrench } from 'lucide-react';

interface TileDetailModalProps {
  tile: Tile | null;
  onClose: () => void;
  activePlayer: Player;
  onUpgrade?: (tileId: number) => void;
  canUpgrade: boolean;
}

export const TileDetailModal: React.FC<TileDetailModalProps> = ({
  tile,
  onClose,
  activePlayer,
  onUpgrade,
  canUpgrade,
}) => {
  if (!tile) return null;

  const isOwner = tile.ownerId === activePlayer.id;
  const canAffordUpgrade = tile.housePrice ? activePlayer.cash >= tile.housePrice : false;
  const maxHouses = (tile.houses || 0) >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">{tile.name}</h3>
            <span className="text-xs text-slate-400">{tile.subtitle || tile.type}</span>
          </div>
        </div>

        {tile.description && (
          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-4">
            {tile.description}
          </p>
        )}

        {tile.type === 'PROPERTY' && (
          <div className="space-y-3 mb-4 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Status Kepemilikan:</span>
                <span className="font-semibold text-slate-200">
                  {tile.ownerId ? `Dimiliki oleh Pemain ${tile.ownerId.slice(-1)}` : 'Belum Dimiliki'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tingkat Rumah:</span>
                <span className="font-semibold text-amber-400">
                  {tile.houses || 0} / 3 Rumah
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Harga Bangun Rumah:</span>
                <span className="font-semibold text-slate-200">
                  {formatRupiah(tile.housePrice || 0)}
                </span>
              </div>
            </div>

            {/* Rents Breakdown */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 space-y-1">
              <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span>Rincian Tarif Sewa:</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tanah Dasar:</span>
                <span className="text-slate-200 font-medium">{formatRupiah(tile.baseRent || 0)}</span>
              </div>
              {tile.houseRents?.map((rent, i) => (
                <div key={i} className="flex justify-between text-slate-400">
                  <span>Rumah Level {i + 1}:</span>
                  <span className="text-slate-200 font-medium">{formatRupiah(rent)}</span>
                </div>
              ))}
            </div>

            {/* Upgrade Action if current player is owner */}
            {isOwner && canUpgrade && !maxHouses && (
              <button
                onClick={() => onUpgrade && onUpgrade(tile.id)}
                disabled={!canAffordUpgrade}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  canAffordUpgrade
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-98'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>
                  {canAffordUpgrade
                    ? `Upgrade Rumah (${formatRupiah(tile.housePrice || 0)})`
                    : 'Uang Tidak Cukup untuk Upgrade'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
