import type { Player, Tile } from '../../types/game';
import { formatRupiah } from '../../utils/format';
import {
  Coins,
  AlertTriangle,
  Flame,
  Coffee,
  Siren,
  Home,
  ShieldAlert,
  HardHat,
  Sparkles,
} from 'lucide-react';

interface TileCellProps {
  tile: Tile;
  playersOnTile: Player[];
  activePlayer: Player;
  onTileClick?: (tile: Tile) => void;
}

const GROUP_COLORS: Record<string, string> = {
  pemukiman_kumuh: 'bg-amber-800 text-amber-100',
  pinggiran_kota: 'bg-sky-600 text-sky-100',
  komersil_lokal: 'bg-orange-600 text-orange-100',
  kawasan_berkembang: 'bg-pink-600 text-pink-100',
  perumahan_menengah: 'bg-red-600 text-red-100',
  kawasan_sultan: 'bg-indigo-600 text-indigo-100',
};

export const TileCell: React.FC<TileCellProps> = ({
  tile,
  playersOnTile,
  activePlayer,
  onTileClick,
}) => {
  const isCorner = [0, 6, 12, 18].includes(tile.id);

  // Render tile icon based on type
  const renderIcon = () => {
    switch (tile.type) {
      case 'START':
        return <Coins className="w-5 h-5 text-emerald-400 animate-pulse" />;
      case 'JAIL':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'REST':
        return <Coffee className="w-5 h-5 text-amber-300" />;
      case 'GO_TO_JAIL':
        return <Siren className="w-5 h-5 text-red-500 animate-bounce" />;
      case 'TAKDIR':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'MUSIBAH':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'TAX':
      case 'PUNGLI':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'PROYEK_TOL':
        return <HardHat className="w-4 h-4 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onTileClick && onTileClick(tile)}
      className={`relative flex flex-col justify-between p-1.5 rounded-lg border transition-all cursor-pointer select-none overflow-hidden h-full
        ${isCorner ? 'bg-slate-900 border-slate-700 shadow-lg' : 'bg-slate-800/90 border-slate-700/80 hover:border-slate-500'}
        ${tile.type === 'START' ? 'border-emerald-500/50 bg-emerald-950/20' : ''}
        ${tile.type === 'GO_TO_JAIL' ? 'border-red-500/50 bg-red-950/20' : ''}
        ${tile.type === 'TAKDIR' ? 'border-cyan-500/40 bg-cyan-950/20' : ''}
        ${tile.type === 'MUSIBAH' ? 'border-orange-500/40 bg-orange-950/20' : ''}
      `}
    >
      {/* Property Color Header */}
      {tile.type === 'PROPERTY' && tile.group && (
        <div
          className={`-mx-1.5 -mt-1.5 px-1 py-0.5 text-[9px] font-bold text-center tracking-wider uppercase rounded-t-lg shadow-sm ${
            GROUP_COLORS[tile.group] || 'bg-slate-600 text-white'
          }`}
        >
          {tile.houses && tile.houses > 0 ? (
            <span className="flex items-center justify-center gap-0.5">
              {Array.from({ length: tile.houses }).map((_, i) => (
                <Home key={i} className="w-2.5 h-2.5 fill-current" />
              ))}
              <span>Lvl {tile.houses}</span>
            </span>
          ) : (
            'Tanah'
          )}
        </div>
      )}

      {/* Main Tile Content */}
      <div className="flex flex-col items-center justify-center text-center my-auto px-0.5">
        <div className="mb-0.5">{renderIcon()}</div>
        <div className="text-[10px] md:text-[11px] font-bold text-slate-100 leading-tight line-clamp-2">
          {tile.name}
        </div>
        {tile.subtitle && (
          <div className="text-[8px] text-slate-400 line-clamp-1 mt-0.5 hidden md:block">
            {tile.subtitle}
          </div>
        )}
      </div>

      {/* Bottom Info: Price / Fee / Ownership */}
      <div className="mt-1 pt-1 border-t border-slate-700/50 flex items-center justify-between text-[9px]">
        {tile.type === 'PROPERTY' && tile.price && (
          <div className="w-full text-center font-medium text-slate-300">
            {tile.ownerId ? (
              <span className="text-emerald-400 font-semibold">Milik P{tile.ownerId.slice(-1)}</span>
            ) : (
              <span className="text-amber-400">{formatRupiah(tile.price).replace(',00', '')}</span>
            )}
          </div>
        )}

        {(tile.type === 'TAX' || tile.type === 'PUNGLI') && tile.amount && (
          <div className="w-full text-center text-rose-400 font-medium">
            -{formatRupiah(tile.amount).replace(',00', '')}
          </div>
        )}

        {tile.type === 'PROYEK_TOL' && tile.amount && (
          <div className="w-full text-center text-emerald-400 font-medium">
            +{formatRupiah(tile.amount).replace(',00', '')}
          </div>
        )}

        {tile.type === 'START' && (
          <div className="w-full text-center text-emerald-400 font-semibold">
            +Rp 2,5 Jt
          </div>
        )}
      </div>

      {/* Players Standing on This Tile */}
      {playersOnTile.length > 0 && (
        <div className="absolute top-1 right-1 flex flex-wrap gap-0.5 max-w-[40px] justify-end z-10">
          {playersOnTile.map(p => {
            const isActive = p.id === activePlayer.id;
            return (
              <div
                key={p.id}
                title={`${p.name} (${formatRupiah(p.cash)})`}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-transform border ${
                  isActive ? 'scale-125 ring-2 ring-amber-400 z-20 animate-pulse' : 'opacity-90'
                }`}
                style={{ backgroundColor: p.color, borderColor: '#ffffff' }}
              >
                <span>{p.avatar}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
