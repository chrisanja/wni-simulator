import React, { useState } from 'react';
import { Dices, Sparkles } from 'lucide-react';

interface DiceProps {
  dice: [number, number];
  isDouble: boolean;
  disabled: boolean;
  onRoll: () => void;
  isBotTurn: boolean;
}

const DOT_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

export const Dice: React.FC<DiceProps> = ({
  dice,
  isDouble,
  disabled,
  onRoll,
  isBotTurn,
}) => {
  const [isRollingAnimation, setIsRollingAnimation] = useState(false);

  const handleRollClick = () => {
    if (disabled || isRollingAnimation) return;
    setIsRollingAnimation(true);
    setTimeout(() => {
      setIsRollingAnimation(false);
      onRoll();
    }, 400);
  };

  const renderDieFace = (val: number) => {
    const dots = DOT_POSITIONS[val] || DOT_POSITIONS[1];
    return (
      <div
        className={`relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-white to-slate-200 rounded-xl shadow-lg border border-slate-300 transition-all ${
          isRollingAnimation ? 'animate-spin scale-95' : 'hover:scale-105'
        }`}
      >
        {dots.map(([top, left], i) => (
          <div
            key={i}
            style={{ top: `${top}%`, left: `${left}%` }}
            className="absolute w-2.5 h-2.5 bg-slate-900 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-inner"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Dice visual container */}
      <div className="flex items-center gap-3">
        {renderDieFace(dice[0])}
        {renderDieFace(dice[1])}
      </div>

      {isDouble && !disabled && (
        <div className="text-xs font-bold text-amber-400 flex items-center gap-1 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dadu Kembar! Bonus Lemparan</span>
        </div>
      )}

      {/* Roll Action Button */}
      <button
        onClick={handleRollClick}
        disabled={disabled || isBotTurn}
        className={`px-5 py-2.5 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
          disabled || isBotTurn
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/40'
        }`}
      >
        <Dices className={`w-5 h-5 ${isRollingAnimation ? 'animate-spin' : ''}`} />
        <span>{isBotTurn ? 'Bot Sedang Berpikir...' : isRollingAnimation ? 'Mengocok Dadu...' : 'Kocok Dadu'}</span>
      </button>
    </div>
  );
};
