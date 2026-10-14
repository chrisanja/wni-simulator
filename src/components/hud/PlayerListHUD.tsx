import type { Player, Tile } from '../../types/game';
import { calculateNetWorth, formatRupiah } from '../../utils/format';
import { ShieldAlert, KeyRound, Skull, Home } from 'lucide-react';

interface PlayerListHUDProps {
  players: Player[];
  activePlayerIndex: number;
  tiles: Tile[];
}

export const PlayerListHUD: React.FC<PlayerListHUDProps> = ({
  players,
  activePlayerIndex,
  tiles,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-5xl mx-auto mb-3">
      {players.map((player, idx) => {
        const isActive = idx === activePlayerIndex;
        const ownedCount = tiles.filter(t => t.ownerId === player.id).length;
        const netWorth = calculateNetWorth(player, tiles);

        return (
          <div
            key={player.id}
            className={`p-2.5 rounded-xl border transition-all ${
              player.isBankrupt
                ? 'bg-slate-900/40 border-slate-800 opacity-50'
                : isActive
                ? 'bg-slate-800 border-amber-400/80 shadow-lg shadow-amber-500/10 scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Header: Avatar, Name, Bot Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs shadow"
                  style={{ backgroundColor: player.color }}
                >
                  {player.avatar}
                </span>
                <span className="font-bold text-xs truncate text-slate-100">
                  {player.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {player.isBot && (
                  <span className="text-[9px] bg-slate-700 text-slate-300 px-1 py-0.5 rounded font-mono">
                    BOT
                  </span>
                )}
                {isActive && !player.isBankrupt && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
            </div>

            {/* Financial Status */}
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Kas Tunai:</span>
                <span
                  className={`font-semibold ${
                    player.cash < 2_000_000 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formatRupiah(player.cash)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[10px]">
                <span>Total Aset:</span>
                <span className="text-slate-200">{formatRupiah(netWorth)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[10px]">
                <span>Properti:</span>
                <span className="text-slate-200 flex items-center gap-0.5">
                  <Home className="w-2.5 h-2.5 text-amber-400" />
                  {ownedCount} petak
                </span>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-1 mt-1.5 min-h-[18px]">
              {player.isBankrupt && (
                <span className="flex items-center gap-0.5 text-[9px] bg-red-950/80 text-red-300 border border-red-800 px-1 py-0.2 rounded font-medium">
                  <Skull className="w-2.5 h-2.5" /> Bangkrut
                </span>
              )}
              {player.inJail && !player.isBankrupt && (
                <span className="flex items-center gap-0.5 text-[9px] bg-rose-950/80 text-rose-300 border border-rose-800 px-1 py-0.2 rounded font-medium">
                  <ShieldAlert className="w-2.5 h-2.5" /> Lapas ({player.jailTurns}/3)
                </span>
              )}
              {player.hasOutJailCard && !player.isBankrupt && (
                <span className="flex items-center gap-0.5 text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-1 py-0.2 rounded font-medium">
                  <KeyRound className="w-2.5 h-2.5" /> Kartu Bebas
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
