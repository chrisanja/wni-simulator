import type { GameLog, GameState, Player } from '../types/game';
import { INITIAL_TILES } from '../data/tiles';
import { TAKDIR_CARDS } from '../data/takdirCards';
import { MUSIBAH_CARDS } from '../data/musibahCards';
import { formatRupiah } from '../utils/format';

export const START_SALARY = 2_500_000;
export const INITIAL_CASH = 15_000_000;
export const JAIL_TILE_INDEX = 6;
export const JAIL_BAIL_AMOUNT = 500_000;

export function createInitialState(playerConfigs: { name: string; avatar: string; color: string; isBot: boolean }[]): GameState {
  const players: Player[] = playerConfigs.map((cfg, index) => ({
    id: `player_${index + 1}`,
    name: cfg.name,
    avatar: cfg.avatar,
    color: cfg.color,
    cash: INITIAL_CASH,
    position: 0,
    inJail: false,
    jailTurns: 0,
    isBankrupt: false,
    isBot: cfg.isBot,
    hasOutJailCard: false,
  }));

  const initialLog: GameLog = {
    id: 'log_start',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    message: `Permainan WNI Simulator dimulai! Semua pemain dibekali dana bansos awal ${formatRupiah(INITIAL_CASH)}. Siap-siap berjuang bertahan hidup!`,
    type: 'success',
  };

  return {
    players,
    currentPlayerIndex: 0,
    tiles: JSON.parse(JSON.stringify(INITIAL_TILES)),
    dice: [1, 1],
    isDouble: false,
    doubleStreak: 0,
    phase: 'WAITING_ROLL',
    activeCard: null,
    logs: [initialLog],
    round: 1,
    winner: null,
  };
}

function addLog(state: GameState, message: string, type: GameLog['type'] = 'info'): GameState {
  const newLog: GameLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    message,
    type,
  };
  return {
    ...state,
    logs: [newLog, ...state.logs.slice(0, 49)], // keep last 50 logs
  };
}

export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function rollDiceEngine(state: GameState): GameState {
  if (state.phase !== 'WAITING_ROLL' || state.winner) return state;

  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const sum = d1 + d2;
  const isDouble = d1 === d2;

  let newState: GameState = {
    ...state,
    dice: [d1, d2] as [number, number],
    isDouble,
  };

  const player = getCurrentPlayer(newState);

  // Check if player is currently in Jail
  if (player.inJail) {
    if (isDouble) {
      newState = addLog(newState, `🎉 ${player.name} melempar dadu kembar (${d1}-${d2}) dan bebas dari Lapas!`, 'success');
      const updatedPlayers = newState.players.map(p =>
        p.id === player.id ? { ...p, inJail: false, jailTurns: 0 } : p
      );
      newState = { ...newState, players: updatedPlayers };
      return movePlayerEngine(newState, sum);
    } else {
      const nextJailTurns = player.jailTurns + 1;
      if (nextJailTurns >= 3) {
        // Forced bail out after 3 failed turns
        newState = addLog(newState, `⏳ Sudah 3 putaran di Lapas. ${player.name} membayar uang jaminan ${formatRupiah(JAIL_BAIL_AMOUNT)} dan bebas.`, 'warning');
        const updatedPlayers = newState.players.map(p =>
          p.id === player.id ? { ...p, inJail: false, jailTurns: 0, cash: p.cash - JAIL_BAIL_AMOUNT } : p
        );
        newState = { ...newState, players: updatedPlayers };
        newState = checkBankruptcy(newState, player.id);
        if (getCurrentPlayer(newState).isBankrupt) {
          return endTurnEngine(newState);
        }
        return movePlayerEngine(newState, sum);
      } else {
        newState = addLog(newState, `🔒 ${player.name} melempar (${d1}-${d2}), bukan kembar. Masih tertahan di Lapas (${nextJailTurns}/3).`, 'warning');
        const updatedPlayers = newState.players.map(p =>
          p.id === player.id ? { ...p, jailTurns: nextJailTurns } : p
        );
        return {
          ...newState,
          players: updatedPlayers,
          phase: 'UPGRADE_PROPERTIES',
        };
      }
    }
  }

  // Not in jail: check streak of doubles
  const streak = isDouble ? state.doubleStreak + 1 : 0;
  newState.doubleStreak = streak;

  if (streak === 3) {
    // 3 doubles in a row = sent to Jail!
    newState = addLog(newState, `🚨 Kena tilang kecepatan tinggi! ${player.name} dapat dadu kembar 3x beruntun. Langsung dijebloskan ke Lapas!`, 'danger');
    const updatedPlayers = newState.players.map(p =>
      p.id === player.id ? { ...p, position: JAIL_TILE_INDEX, inJail: true, jailTurns: 0 } : p
    );
    return {
      ...newState,
      players: updatedPlayers,
      phase: 'UPGRADE_PROPERTIES',
    };
  }

  newState = addLog(newState, `🎲 ${player.name} melempar dadu: ${d1} + ${d2} = ${sum}${isDouble ? ' (Dadu Kembar!)' : ''}`, 'info');

  return movePlayerEngine(newState, sum);
}

export function movePlayerEngine(state: GameState, steps: number): GameState {
  const player = getCurrentPlayer(state);
  const oldPos = player.position;
  const newPos = (oldPos + steps) % 24;
  const passedStart = oldPos + steps >= 24;

  let newState: GameState = { ...state };
  let newCash = player.cash;

  if (passedStart) {
    newCash += START_SALARY;
    newState = addLog(newState, `💵 ${player.name} melewati/berada di START dan menerima gaji bulanan ${formatRupiah(START_SALARY)}!`, 'success');
  }

  const updatedPlayers = newState.players.map(p =>
    p.id === player.id ? { ...p, position: newPos, cash: newCash } : p
  );
  newState = { ...newState, players: updatedPlayers };

  // Resolve tile landed on
  return resolveLandedTile(newState, newPos);
}

function resolveLandedTile(state: GameState, tileIndex: number): GameState {
  const player = getCurrentPlayer(state);
  const tile = state.tiles[tileIndex];

  let newState = addLog(state, `📍 ${player.name} mendarat di petak "${tile.name}"`, 'info');

  switch (tile.type) {
    case 'START':
      return { ...newState, phase: 'UPGRADE_PROPERTIES' };

    case 'PROPERTY': {
      if (!tile.ownerId) {
        // Can buy
        return { ...newState, phase: 'TILE_ACTION' };
      } else if (tile.ownerId === player.id) {
        // Own property
        newState = addLog(newState, `🏠 Ini adalah properti milik ${player.name} sendiri. Aman tentram!`, 'info');
        return { ...newState, phase: 'UPGRADE_PROPERTIES' };
      } else {
        // Owned by other player: pay rent!
        const owner = newState.players.find(p => p.id === tile.ownerId);
        if (!owner || owner.isBankrupt) {
          return { ...newState, phase: 'UPGRADE_PROPERTIES' };
        }

        // Calculate rent
        let rent = tile.baseRent || 0;
        if (tile.houses && tile.houses > 0 && tile.houseRents && tile.houseRents[tile.houses - 1]) {
          rent = tile.houseRents[tile.houses - 1];
        }

        newState = addLog(newState, `💸 ${player.name} mendarat di properti ${owner.name} (${tile.houses || 0} rumah) dan harus bayar sewa ${formatRupiah(rent)}!`, 'danger');

        const updatedPlayers = newState.players.map(p => {
          if (p.id === player.id) return { ...p, cash: p.cash - rent };
          if (p.id === owner.id) return { ...p, cash: p.cash + rent };
          return p;
        });

        newState = { ...newState, players: updatedPlayers };
        newState = checkBankruptcy(newState, player.id);
        return { ...newState, phase: 'UPGRADE_PROPERTIES' };
      }
    }

    case 'TAKDIR': {
      const card = TAKDIR_CARDS[Math.floor(Math.random() * TAKDIR_CARDS.length)];
      return {
        ...newState,
        activeCard: card,
        phase: 'SHOWING_CARD',
      };
    }

    case 'MUSIBAH': {
      const card = MUSIBAH_CARDS[Math.floor(Math.random() * MUSIBAH_CARDS.length)];
      return {
        ...newState,
        activeCard: card,
        phase: 'SHOWING_CARD',
      };
    }

    case 'TAX':
    case 'PUNGLI': {
      const fee = tile.amount || 0;
      newState = addLog(newState, `⚠️ ${player.name} terkena ${tile.name}: Wajib bayar ${formatRupiah(fee)}!`, 'warning');
      const updatedPlayers = newState.players.map(p =>
        p.id === player.id ? { ...p, cash: p.cash - fee } : p
      );
      newState = { ...newState, players: updatedPlayers };
      newState = checkBankruptcy(newState, player.id);
      return { ...newState, phase: 'UPGRADE_PROPERTIES' };
    }

    case 'PROYEK_TOL': {
      const reward = tile.amount || 0;
      newState = addLog(newState, `🏗️ ${player.name} dapat ganti rugi proyek jalan tol sebesar ${formatRupiah(reward)}!`, 'success');
      const updatedPlayers = newState.players.map(p =>
        p.id === player.id ? { ...p, cash: p.cash + reward } : p
      );
      return { ...newState, players: updatedPlayers, phase: 'UPGRADE_PROPERTIES' };
    }

    case 'GO_TO_JAIL': {
      newState = addLog(newState, `🚨 Kena OTT KPK! ${player.name} langsung dijebloskan ke Lapas!`, 'danger');
      const updatedPlayers = newState.players.map(p =>
        p.id === player.id ? { ...p, position: JAIL_TILE_INDEX, inJail: true, jailTurns: 0 } : p
      );
      return { ...newState, players: updatedPlayers, phase: 'UPGRADE_PROPERTIES' };
    }

    case 'REST':
    case 'JAIL':
      return { ...newState, phase: 'UPGRADE_PROPERTIES' };

    default:
      return { ...newState, phase: 'UPGRADE_PROPERTIES' };
  }
}

export function buyCurrentPropertyEngine(state: GameState): GameState {
  const player = getCurrentPlayer(state);
  const tile = state.tiles[player.position];

  if (tile.type !== 'PROPERTY' || tile.ownerId || !tile.price) {
    return { ...state, phase: 'UPGRADE_PROPERTIES' };
  }

  if (player.cash < tile.price) {
    return addLog(state, `❌ Saldo kas ${player.name} tidak cukup untuk membeli ${tile.name}!`, 'warning');
  }

  const updatedPlayers = state.players.map(p =>
    p.id === player.id ? { ...p, cash: p.cash - tile.price! } : p
  );

  const updatedTiles = state.tiles.map(t =>
    t.id === tile.id ? { ...t, ownerId: player.id, houses: 0 } : t
  );

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    tiles: updatedTiles,
    phase: 'UPGRADE_PROPERTIES',
  };

  return addLog(newState, `🏠 ${player.name} berhasil membeli properti ${tile.name} seharga ${formatRupiah(tile.price)}!`, 'success');
}

export function passBuyPropertyEngine(state: GameState): GameState {
  const player = getCurrentPlayer(state);
  const tile = state.tiles[player.position];
  const newState = addLog(state, `⏭️ ${player.name} memutuskan untuk tidak membeli ${tile.name}.`, 'info');
  return { ...newState, phase: 'UPGRADE_PROPERTIES' };
}

export function upgradePropertyEngine(state: GameState, tileId: number): GameState {
  const player = getCurrentPlayer(state);
  const tile = state.tiles.find(t => t.id === tileId);

  if (!tile || tile.ownerId !== player.id || !tile.housePrice) {
    return state;
  }

  if ((tile.houses || 0) >= 3) {
    return addLog(state, `⚠️ Properti ${tile.name} sudah mencapai level maksimal (3 rumah/ruko)!`, 'warning');
  }

  if (player.cash < tile.housePrice) {
    return addLog(state, `❌ Kas ${player.name} tidak cukup (${formatRupiah(tile.housePrice)} dibutuhkan) untuk membangun rumah di ${tile.name}!`, 'warning');
  }

  const updatedPlayers = state.players.map(p =>
    p.id === player.id ? { ...p, cash: p.cash - tile.housePrice! } : p
  );

  const newHouses = (tile.houses || 0) + 1;
  const updatedTiles = state.tiles.map(t =>
    t.id === tileId ? { ...t, houses: newHouses } : t
  );

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    tiles: updatedTiles,
  };

  return addLog(newState, `🔨 ${player.name} membangun rumah level ${newHouses} di ${tile.name} seharga ${formatRupiah(tile.housePrice)}!`, 'success');
}

export function resolveActiveCardEngine(state: GameState): GameState {
  const card = state.activeCard;
  if (!card) return { ...state, phase: 'UPGRADE_PROPERTIES' };

  const player = getCurrentPlayer(state);
  let newState: GameState = { ...state, activeCard: null };

  switch (card.actionType) {
    case 'CASH_CHANGE': {
      const amount = card.amount || 0;
      const updatedPlayers = newState.players.map(p =>
        p.id === player.id ? { ...p, cash: p.cash + amount } : p
      );
      newState = { ...newState, players: updatedPlayers };
      newState = addLog(
        newState,
        amount >= 0
          ? `🎁 ${player.name} mendapatkan ${formatRupiah(amount)} dari kartu ${card.title}!`
          : `💸 ${player.name} kehilangan ${formatRupiah(Math.abs(amount))} akibat kartu ${card.title}!`,
        amount >= 0 ? 'takdir' : 'musibah'
      );
      newState = checkBankruptcy(newState, player.id);
      break;
    }

    case 'GET_OUT_JAIL_CARD': {
      const updatedPlayers = newState.players.map(p =>
        p.id === player.id ? { ...p, hasOutJailCard: true } : p
      );
      newState = { ...newState, players: updatedPlayers };
      newState = addLog(newState, `📜 ${player.name} menyimpan "Kartu Sakti Jalur Orang Dalam" untuk keluar dari Lapas!`, 'takdir');
      break;
    }

    case 'GO_TO_JAIL': {
      newState = addLog(newState, `🚨 Kena musibah: ${player.name} langsung dimasukkan ke Lapas!`, 'danger');
      const updatedPlayers = newState.players.map(p =>
        p.id === player.id ? { ...p, position: JAIL_TILE_INDEX, inJail: true, jailTurns: 0 } : p
      );
      newState = { ...newState, players: updatedPlayers };
      break;
    }

    case 'MOVE_TO': {
      const targetId = card.targetTileId ?? 0;
      newState = addLog(newState, `🏃 ${player.name} bergerak langsung ke petak ${newState.tiles[targetId].name}!`, 'takdir');
      return movePlayerEngine(newState, (targetId - player.position + 24) % 24);
    }

    case 'COLLECT_FROM_ALL': {
      const amount = card.amount || 0;
      let totalCollected = 0;
      const updatedPlayers = newState.players.map(p => {
        if (p.id !== player.id && !p.isBankrupt) {
          totalCollected += amount;
          return { ...p, cash: p.cash - amount };
        }
        return p;
      });
      const finalPlayers = updatedPlayers.map(p =>
        p.id === player.id ? { ...p, cash: p.cash + totalCollected } : p
      );
      newState = { ...newState, players: finalPlayers };
      newState = addLog(newState, `🧧 ${player.name} mengumpulkan total ${formatRupiah(totalCollected)} dari pemain lain!`, 'takdir');
      break;
    }

    case 'PAY_ALL_PLAYERS': {
      const amount = card.amount || 0;
      let totalPaid = 0;
      const otherActiveCount = newState.players.filter(p => p.id !== player.id && !p.isBankrupt).length;
      totalPaid = amount * otherActiveCount;

      const updatedPlayers = newState.players.map(p => {
        if (p.id === player.id) {
          return { ...p, cash: p.cash - totalPaid };
        } else if (!p.isBankrupt) {
          return { ...p, cash: p.cash + amount };
        }
        return p;
      });
      newState = { ...newState, players: updatedPlayers };
      newState = addLog(newState, `💸 ${player.name} membagikan amplop ${formatRupiah(amount)} ke setiap pemain lain!`, 'musibah');
      newState = checkBankruptcy(newState, player.id);
      break;
    }

    case 'PER_PROPERTY_FEE': {
      const feePerHouse = card.amount || 0;
      let totalHouses = 0;
      newState.tiles.forEach(t => {
        if (t.ownerId === player.id) {
          totalHouses += t.houses || 0;
        }
      });
      const totalCost = totalHouses * feePerHouse;
      const updatedPlayers = newState.players.map(p =>
        p.id === player.id ? { ...p, cash: p.cash - totalCost } : p
      );
      newState = { ...newState, players: updatedPlayers };
      newState = addLog(newState, `🏚️ ${player.name} membayar biaya musibah properti sebesar ${formatRupiah(totalCost)} (${totalHouses} rumah)!`, 'musibah');
      newState = checkBankruptcy(newState, player.id);
      break;
    }
  }

  return { ...newState, phase: 'UPGRADE_PROPERTIES' };
}

export function payBailOutEngine(state: GameState): GameState {
  const player = getCurrentPlayer(state);
  if (!player.inJail) return state;

  if (player.hasOutJailCard) {
    const updatedPlayers = state.players.map(p =>
      p.id === player.id ? { ...p, inJail: false, jailTurns: 0, hasOutJailCard: false } : p
    );
    const newState: GameState = { ...state, players: updatedPlayers };
    return addLog(newState, `📜 ${player.name} menggunakan "Kartu Sakti Jalur Orang Dalam" dan bebas dari Lapas seketika!`, 'success');
  }

  if (player.cash < JAIL_BAIL_AMOUNT) {
    return addLog(state, `❌ Kas ${player.name} tidak cukup untuk membayar uang jaminan ${formatRupiah(JAIL_BAIL_AMOUNT)}!`, 'warning');
  }

  const updatedPlayers = state.players.map(p =>
    p.id === player.id ? { ...p, inJail: false, jailTurns: 0, cash: p.cash - JAIL_BAIL_AMOUNT } : p
  );
  const newState: GameState = { ...state, players: updatedPlayers };
  return addLog(newState, `🔓 ${player.name} membayar denda jaminan ${formatRupiah(JAIL_BAIL_AMOUNT)} dan bebas dari Lapas!`, 'success');
}

export function checkBankruptcy(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.cash >= 0 || player.isBankrupt) return state;

  // Bankruptcy triggered! Confiscate properties (Sita Negara)
  let newState = addLog(state, `💀 SITA NEGARA! Kas ${player.name} minus (${formatRupiah(player.cash)}). ${player.name} dinyatakan BANGKRUT dan dieliminasi!`, 'danger');

  const updatedTiles = newState.tiles.map(t =>
    t.ownerId === player.id ? { ...t, ownerId: null, houses: 0 } : t
  );

  const updatedPlayers = newState.players.map(p =>
    p.id === player.id ? { ...p, isBankrupt: true } : p
  );

  newState = {
    ...newState,
    tiles: updatedTiles,
    players: updatedPlayers,
  };

  // Check victory condition: only 1 player remains!
  const activePlayers = newState.players.filter(p => !p.isBankrupt);
  if (activePlayers.length === 1) {
    const winner = activePlayers[0];
    newState = addLog(newState, `👑 SELAMAT! ${winner.name} adalah warga paling tangguh dan keluar sebagai PEMENANG WNI Simulator!`, 'success');
    return {
      ...newState,
      winner,
      phase: 'GAME_OVER',
    };
  }

  return newState;
}

export function endTurnEngine(state: GameState): GameState {
  if (state.winner) return state;

  const player = getCurrentPlayer(state);

  // If player rolled double and is not in jail and not bankrupt, they can roll again!
  if (state.isDouble && !player.inJail && !player.isBankrupt && state.doubleStreak > 0 && state.doubleStreak < 3) {
    const newState = addLog(state, `✨ Karena dapat dadu kembar, ${player.name} berhak melempar dadu sekali lagi!`, 'info');
    return {
      ...newState,
      phase: 'WAITING_ROLL',
    };
  }

  // Next player
  let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  // Skip bankrupt players
  let attempts = 0;
  while (state.players[nextIndex].isBankrupt && attempts < state.players.length) {
    nextIndex = (nextIndex + 1) % state.players.length;
    attempts++;
  }

  const isNewRound = nextIndex <= state.currentPlayerIndex;
  const newRound = isNewRound ? state.round + 1 : state.round;

  const nextPlayer = state.players[nextIndex];
  const newState: GameState = {
    ...state,
    currentPlayerIndex: nextIndex,
    doubleStreak: 0,
    isDouble: false,
    phase: 'WAITING_ROLL',
    round: newRound,
  };

  return addLog(newState, `👉 Giliran ${nextPlayer.name} (${nextPlayer.isBot ? 'Bot' : 'Pemain'}).`, 'info');
}
