import { useState, useEffect, useRef } from 'react';
import type { GameState, Tile } from './types/game';
import {
  createInitialState,
  rollDiceEngine,
  buyCurrentPropertyEngine,
  passBuyPropertyEngine,
  upgradePropertyEngine,
  resolveActiveCardEngine,
  payBailOutEngine,
  endTurnEngine,
  getCurrentPlayer,
} from './engine/gameEngine';
import { runBotTurn } from './engine/botAi';
import { Board } from './components/board/Board';
import { Dice } from './components/controls/Dice';
import { PlayerListHUD } from './components/hud/PlayerListHUD';
import { GameLogTicker } from './components/hud/GameLogTicker';
import { CardModal } from './components/modals/CardModal';
import { PropertyActionModal } from './components/modals/PropertyActionModal';
import { TileDetailModal } from './components/modals/TileDetailModal';
import { GameOverModal } from './components/modals/GameOverModal';
import { GameSetupModal } from './components/setup/GameSetupModal';
import {
  ShieldAlert,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export function App() {
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState([
      { name: 'Budi Santoso', avatar: '🛵', color: '#3b82f6', isBot: false },
      { name: 'Slamet Kopling', avatar: '🚗', color: '#ef4444', isBot: true },
      { name: 'Agus Knalpot', avatar: '🚲', color: '#10b981', isBot: true },
    ])
  );

  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayer = getCurrentPlayer(gameState);
  const currentTile = gameState.tiles[currentPlayer?.position ?? 0];

  // Start new game from setup
  const handleStartGame = (
    configs: { name: string; avatar: string; color: string; isBot: boolean }[]
  ) => {
    setGameState(createInitialState(configs));
    setIsSetupOpen(false);
  };

  // Automated bot turns with delay for readability
  useEffect(() => {
    if (isSetupOpen || gameState.winner) return;

    if (currentPlayer?.isBot) {
      botTimeoutRef.current = setTimeout(() => {
        setGameState(prev => runBotTurn(prev));
      }, 1000);
    }

    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    };
  }, [
    currentPlayer?.isBot,
    currentPlayer?.id,
    gameState.phase,
    isSetupOpen,
    gameState.winner,
  ]);

  // Turn Actions
  const handleRollDice = () => {
    setGameState(prev => rollDiceEngine(prev));
  };

  const handleBuyProperty = () => {
    setGameState(prev => buyCurrentPropertyEngine(prev));
  };

  const handlePassBuyProperty = () => {
    setGameState(prev => passBuyPropertyEngine(prev));
  };

  const handleResolveCard = () => {
    setGameState(prev => resolveActiveCardEngine(prev));
  };

  const handlePayBail = () => {
    setGameState(prev => payBailOutEngine(prev));
  };

  const handleUpgradeProperty = (tileId: number) => {
    setGameState(prev => upgradePropertyEngine(prev, tileId));
    // update inspected tile if open
    setSelectedTile(prev => (prev && prev.id === tileId ? gameState.tiles[tileId] : prev));
  };

  const handleEndTurn = () => {
    setGameState(prev => endTurnEngine(prev));
  };

  const handleRestart = () => {
    setIsSetupOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-2 md:p-6 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            +62
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>WNI SIMULATOR</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-bold">
                EDISI DIGITAL
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Bertahan hidup dari cobaan ekonomi, tilang, dan musibah!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-xs font-semibold text-slate-300">
            Putaran: <span className="text-amber-400 font-bold">{gameState.round}</span>
          </div>
          <button
            onClick={handleRestart}
            title="Mulai Ulang Permainan"
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Player Status Cards (HUD) */}
      <PlayerListHUD
        players={gameState.players}
        activePlayerIndex={gameState.currentPlayerIndex}
        tiles={gameState.tiles}
      />

      {/* Main Board View */}
      <main className="w-full max-w-5xl flex-1 flex flex-col justify-center">
        <Board
          state={gameState}
          onTileClick={tile => setSelectedTile(tile)}
          centerContent={
            <div className="flex flex-col justify-between h-full gap-2">
              {/* Center Arena Top: Turn Notification */}
              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md border"
                    style={{ backgroundColor: currentPlayer.color, borderColor: '#ffffff' }}
                  >
                    {currentPlayer.avatar}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{currentPlayer.name}</span>
                      {currentPlayer.isBot && (
                        <span className="text-[9px] bg-slate-700 px-1 py-0.2 rounded text-slate-300 font-mono">
                          BOT
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {gameState.phase === 'WAITING_ROLL' && 'Giliran Melempar Dadu'}
                      {gameState.phase === 'TILE_ACTION' && 'Memilih Beli Properti'}
                      {gameState.phase === 'SHOWING_CARD' && 'Mendapatkan Kartu Kejadian'}
                      {gameState.phase === 'UPGRADE_PROPERTIES' && 'Kelola Properti & Akhiri Giliran'}
                    </div>
                  </div>
                </div>

                {/* Bail Option if in Jail */}
                {currentPlayer.inJail && gameState.phase === 'WAITING_ROLL' && !currentPlayer.isBot && (
                  <button
                    onClick={handlePayBail}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 flex items-center gap-1 transition-all"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>
                      {currentPlayer.hasOutJailCard
                        ? 'Gunakan Kartu Bebas'
                        : `Bebas Rp 500rb`}
                    </span>
                  </button>
                )}
              </div>

              {/* Center Arena Middle: Dice Roller or Turn Actions */}
              <div className="flex flex-col items-center justify-center py-1">
                {gameState.phase === 'WAITING_ROLL' && (
                  <Dice
                    dice={gameState.dice}
                    isDouble={gameState.isDouble}
                    disabled={currentPlayer.isBankrupt}
                    onRoll={handleRollDice}
                    isBotTurn={currentPlayer.isBot}
                  />
                )}

                {gameState.phase === 'UPGRADE_PROPERTIES' && (
                  <div className="flex flex-col items-center gap-2 w-full max-w-xs text-center">
                    <p className="text-xs text-slate-300 font-medium">
                      Kamu bisa klik tanah milikmu di papan untuk membangun rumah, atau akhiri giliran sekarang.
                    </p>
                    <button
                      onClick={handleEndTurn}
                      disabled={currentPlayer.isBot}
                      className="w-full py-2.5 rounded-xl font-bold text-xs md:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <span>Selesai Giliran</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Center Arena Bottom: Live Game Log Ticker */}
              <GameLogTicker logs={gameState.logs} />
            </div>
          }
        />
      </main>

      {/* Interactive Modals */}
      {isSetupOpen && <GameSetupModal onStartGame={handleStartGame} />}

      <PropertyActionModal
        tile={currentTile}
        player={currentPlayer}
        onBuy={handleBuyProperty}
        onPass={handlePassBuyProperty}
        isBotTurn={currentPlayer.isBot}
      />

      <CardModal
        card={gameState.activeCard}
        onConfirm={handleResolveCard}
        isBotTurn={currentPlayer.isBot}
      />

      <TileDetailModal
        tile={selectedTile}
        onClose={() => setSelectedTile(null)}
        activePlayer={currentPlayer}
        onUpgrade={handleUpgradeProperty}
        canUpgrade={gameState.phase === 'UPGRADE_PROPERTIES'}
      />

      <GameOverModal
        winner={gameState.winner}
        tiles={gameState.tiles}
        onRestart={handleRestart}
      />
    </div>
  );
}

export default App;
