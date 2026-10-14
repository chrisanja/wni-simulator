import type { GameCard } from '../../types/game';
import { Sparkles, Flame, Check } from 'lucide-react';

interface CardModalProps {
  card: GameCard | null;
  onConfirm: () => void;
  isBotTurn: boolean;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  onConfirm,
  isBotTurn,
}) => {
  if (!card) return null;

  const isTakdir = card.category === 'TAKDIR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative select-none transform transition-all ${
          isTakdir
            ? 'bg-gradient-to-b from-slate-900 to-cyan-950/60 border-cyan-500/50 shadow-cyan-500/20'
            : 'bg-gradient-to-b from-slate-900 to-orange-950/60 border-orange-500/50 shadow-orange-500/20'
        }`}
      >
        {/* Category Header Badge */}
        <div className="flex items-center justify-center mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-1.5 shadow ${
              isTakdir
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-orange-500 text-slate-950'
            }`}
          >
            {isTakdir ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>KARTU TAKDIR</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5" />
                <span>KARTU MUSIBAH</span>
              </>
            )}
          </span>
        </div>

        {/* Card Title */}
        <h2 className="text-xl font-extrabold text-center text-slate-100 mb-2">
          {card.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-300 text-center mb-4 leading-relaxed font-medium">
          {card.description}
        </p>

        {/* Satire Flavor Text */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs italic text-slate-400 text-center mb-6">
          {card.flavorText}
        </div>

        {/* Confirm Button */}
        <button
          onClick={onConfirm}
          disabled={isBotTurn}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
            isTakdir
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
              : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/25'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isTakdir ? 'Syukuri Takdir Ini' : 'Pasrah Hadapi Musibah'}</span>
        </button>
      </div>
    </div>
  );
};
