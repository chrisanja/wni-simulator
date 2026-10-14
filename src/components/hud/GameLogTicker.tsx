import type { GameLog } from '../../types/game';
import { ScrollText } from 'lucide-react';

interface GameLogTickerProps {
  logs: GameLog[];
}

export const GameLogTicker: React.FC<GameLogTickerProps> = ({ logs }) => {
  const getLogStyle = (type: GameLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-300 bg-emerald-950/30 border-l-2 border-emerald-500';
      case 'danger':
        return 'text-rose-300 bg-rose-950/30 border-l-2 border-rose-500';
      case 'warning':
        return 'text-amber-300 bg-amber-950/30 border-l-2 border-amber-500';
      case 'takdir':
        return 'text-cyan-300 bg-cyan-950/30 border-l-2 border-cyan-500';
      case 'musibah':
        return 'text-orange-300 bg-orange-950/30 border-l-2 border-orange-500';
      default:
        return 'text-slate-300 bg-slate-800/40 border-l-2 border-slate-600';
    }
  };

  return (
    <div className="flex flex-col h-28 md:h-36 bg-slate-950/80 rounded-xl border border-slate-800 p-2 overflow-hidden shadow-inner">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1 px-1 border-b border-slate-800 pb-1">
        <ScrollText className="w-3.5 h-3.5 text-amber-400" />
        <span>KABAR BERITA & RIWAYAT PERISTIWA</span>
      </div>
      <div className="overflow-y-auto space-y-1 pr-1 flex-1">
        {logs.map(log => (
          <div
            key={log.id}
            className={`px-2 py-1 rounded text-[11px] leading-tight flex items-start justify-between gap-2 ${getLogStyle(
              log.type
            )}`}
          >
            <span className="flex-1">{log.message}</span>
            <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap mt-0.5">
              {log.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
