import type { GameState } from '../types/game';
import {
  buyCurrentPropertyEngine,
  passBuyPropertyEngine,
  upgradePropertyEngine,
  endTurnEngine,
  payBailOutEngine,
  rollDiceEngine,
  resolveActiveCardEngine,
  getCurrentPlayer,
} from './gameEngine';

export function runBotTurn(state: GameState): GameState {
  const player = getCurrentPlayer(state);
  if (!player.isBot || state.winner) return state;

  // 1. If in jail, check if bot can get out immediately
  if (player.inJail && state.phase === 'WAITING_ROLL') {
    if (player.hasOutJailCard || player.cash > 4_000_000) {
      const bailedState = payBailOutEngine(state);
      // after paying bail, proceed to roll
      return rollDiceEngine(bailedState);
    }
  }

  // 2. If waiting for roll, roll!
  if (state.phase === 'WAITING_ROLL') {
    return rollDiceEngine(state);
  }

  // 3. If showing card, acknowledge and resolve
  if (state.phase === 'SHOWING_CARD') {
    return resolveActiveCardEngine(state);
  }

  // 4. If deciding on buying property
  if (state.phase === 'TILE_ACTION') {
    const tile = state.tiles[player.position];
    const safetyBuffer = 2_000_000;
    if (tile.price && player.cash - tile.price >= safetyBuffer) {
      return buyCurrentPropertyEngine(state);
    } else {
      return passBuyPropertyEngine(state);
    }
  }

  // 5. If in upgrade phase
  if (state.phase === 'UPGRADE_PROPERTIES') {
    // Check if bot can afford an upgrade on any of its properties
    const upgradeable = state.tiles.filter(
      t => t.ownerId === player.id && (t.houses || 0) < 3 && t.housePrice && player.cash - t.housePrice >= 3_500_000
    );

    if (upgradeable.length > 0) {
      // Pick the cheapest one to upgrade
      upgradeable.sort((a, b) => (a.housePrice || 0) - (b.housePrice || 0));
      const upgradedState = upgradePropertyEngine(state, upgradeable[0].id);
      return endTurnEngine(upgradedState);
    }

    return endTurnEngine(state);
  }

  return state;
}
