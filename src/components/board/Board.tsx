import type { GameState, Tile } from '../../types/game';
import { TileCell } from './TileCell';
import { getCurrentPlayer } from '../../engine/gameEngine';

interface BoardProps {
  state: GameState;
  onTileClick?: (tile: Tile) => void;
  centerContent?: React.ReactNode;
}

// Map each tile ID (0 to 23) to its 1-indexed CSS Grid (row, col) in a 7x7 perimeter
const TILE_GRID_POSITIONS: Record<number, { row: number; col: number }> = {
  // Bottom Row (Right to Left): 0 to 6
  0: { row: 7, col: 7 }, // START
  1: { row: 7, col: 6 },
  2: { row: 7, col: 5 },
  3: { row: 7, col: 4 },
  4: { row: 7, col: 3 },
  5: { row: 7, col: 2 },
  6: { row: 7, col: 1 }, // LAPAS / JAIL

  // Left Col (Bottom to Top): 7 to 11
  7: { row: 6, col: 1 },
  8: { row: 5, col: 1 },
  9: { row: 4, col: 1 },
  10: { row: 3, col: 1 },
  11: { row: 2, col: 1 },

  // Top Row (Left to Right): 12 to 18
  12: { row: 1, col: 1 }, // WARKOP
  13: { row: 1, col: 2 },
  14: { row: 1, col: 3 },
  15: { row: 1, col: 4 },
  16: { row: 1, col: 5 },
  17: { row: 1, col: 6 },
  18: { row: 1, col: 7 }, // OTT KPK / GO TO JAIL

  // Right Col (Top to Bottom): 19 to 23
  19: { row: 2, col: 7 },
  20: { row: 3, col: 7 },
  21: { row: 4, col: 7 },
  22: { row: 5, col: 7 },
  23: { row: 6, col: 7 },
};

export const Board: React.FC<BoardProps> = ({ state, onTileClick, centerContent }) => {
  const activePlayer = getCurrentPlayer(state);

  return (
    <div className="w-full max-w-5xl mx-auto aspect-square p-2 md:p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl relative select-none">
      <div className="grid grid-cols-7 grid-rows-7 gap-1.5 md:gap-2 w-full h-full">
        {/* Render the 24 Perimeter Tiles */}
        {state.tiles.map(tile => {
          const pos = TILE_GRID_POSITIONS[tile.id];
          const playersHere = state.players.filter(p => !p.isBankrupt && p.position === tile.id);

          return (
            <div
              key={tile.id}
              style={{
                gridRow: pos.row,
                gridColumn: pos.col,
              }}
              className="w-full h-full min-h-[52px] md:min-h-[75px]"
            >
              <TileCell
                tile={tile}
                playersOnTile={playersHere}
                activePlayer={activePlayer}
                onTileClick={onTileClick}
              />
            </div>
          );
        })}

        {/* Center Canvas (5x5 Grid Area: row 2 to 6, col 2 to 6) */}
        <div
          style={{
            gridRow: '2 / span 5',
            gridColumn: '2 / span 5',
          }}
          className="relative w-full h-full rounded-xl bg-slate-900/90 border border-slate-800/80 p-3 md:p-6 flex flex-col justify-between overflow-hidden shadow-inner"
        >
          {centerContent}
        </div>
      </div>
    </div>
  );
};
