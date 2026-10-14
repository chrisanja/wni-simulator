import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  movePlayerEngine,
  buyCurrentPropertyEngine,
  upgradePropertyEngine,
  checkBankruptcy,
  payBailOutEngine,
  START_SALARY,
  INITIAL_CASH,
  JAIL_TILE_INDEX,
  JAIL_BAIL_AMOUNT,
} from './gameEngine';

describe('WNI Simulator Game Engine', () => {
  const setupTestGame = () => {
    return createInitialState([
      { name: 'Budi', avatar: '🛵', color: '#3b82f6', isBot: false },
      { name: 'Slamet', avatar: '🚗', color: '#ef4444', isBot: true },
    ]);
  };

  it('initializes game with correct starting capital and positions', () => {
    const state = setupTestGame();
    expect(state.players).toHaveLength(2);
    expect(state.players[0].cash).toBe(INITIAL_CASH);
    expect(state.players[0].position).toBe(0);
    expect(state.phase).toBe('WAITING_ROLL');
    expect(state.winner).toBeNull();
  });

  it('rewards salary when passing or landing on START tile', () => {
    const state = setupTestGame();
    // Player 1 at 0 moves 24 steps around the board back to 0
    const moved = movePlayerEngine(state, 24);
    expect(moved.players[0].position).toBe(0);
    expect(moved.players[0].cash).toBe(INITIAL_CASH + START_SALARY);
  });

  it('allows buying an unowned property and deducts correct price', () => {
    let state = setupTestGame();
    // Move to tile 1 (Kos Gang Senggol, price 1_000_000)
    state = movePlayerEngine(state, 1);
    expect(state.phase).toBe('TILE_ACTION');

    const bought = buyCurrentPropertyEngine(state);
    expect(bought.players[0].cash).toBe(INITIAL_CASH - 1_000_000);
    expect(bought.tiles[1].ownerId).toBe('player_1');
    expect(bought.phase).toBe('UPGRADE_PROPERTIES');
  });

  it('charges rent when opponent lands on owned property', () => {
    let state = setupTestGame();
    // Player 1 buys tile 1 (Kos Gang Senggol, price 1_000_000, base rent 150_000)
    state = movePlayerEngine(state, 1);
    state = buyCurrentPropertyEngine(state);

    // Switch turn to Player 2
    state.currentPlayerIndex = 1;
    // Player 2 moves to tile 1
    const visited = movePlayerEngine(state, 1);
    expect(visited.players[1].cash).toBe(INITIAL_CASH - 150_000);
    expect(visited.players[0].cash).toBe(INITIAL_CASH - 1_000_000 + 150_000);
  });

  it('allows owner to upgrade house and increases rent', () => {
    let state = setupTestGame();
    state = movePlayerEngine(state, 1); // Kos Gang Senggol: housePrice 500_000, 1 house rent 350_000
    state = buyCurrentPropertyEngine(state);

    // Upgrade house on tile 1
    const upgraded = upgradePropertyEngine(state, 1);
    expect(upgraded.tiles[1].houses).toBe(1);
    expect(upgraded.players[0].cash).toBe(INITIAL_CASH - 1_000_000 - 500_000);

    // Player 2 visits upgraded property
    upgraded.currentPlayerIndex = 1;
    const visited = movePlayerEngine(upgraded, 1);
    expect(visited.players[1].cash).toBe(INITIAL_CASH - 350_000);
  });

  it('triggers bankruptcy, confiscates assets, and declares remaining player winner', () => {
    let state = setupTestGame();
    // Give player 1 negative cash
    state.players[0].cash = -100_000;
    state.tiles[1].ownerId = 'player_1';
    state.tiles[1].houses = 2;

    const bankrupted = checkBankruptcy(state, 'player_1');
    expect(bankrupted.players[0].isBankrupt).toBe(true);
    // Assets confiscated (Sita Negara)
    expect(bankrupted.tiles[1].ownerId).toBeNull();
    expect(bankrupted.tiles[1].houses).toBe(0);
    // Only 1 player left -> Player 2 wins!
    expect(bankrupted.winner?.id).toBe('player_2');
    expect(bankrupted.phase).toBe('GAME_OVER');
  });

  it('handles jail bail out mechanics', () => {
    let state = setupTestGame();
    state.players[0].inJail = true;
    state.players[0].position = JAIL_TILE_INDEX;

    const bailed = payBailOutEngine(state);
    expect(bailed.players[0].inJail).toBe(false);
    expect(bailed.players[0].cash).toBe(INITIAL_CASH - JAIL_BAIL_AMOUNT);
  });
});
