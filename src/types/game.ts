export type TileType =
  | 'START'
  | 'PROPERTY'
  | 'TAKDIR'
  | 'MUSIBAH'
  | 'TAX'
  | 'PUNGLI'
  | 'JAIL'
  | 'GO_TO_JAIL'
  | 'REST'
  | 'PROYEK_TOL';

export type PropertyGroup =
  | 'pemukiman_kumuh'   // Cokelat
  | 'pinggiran_kota'    // Biru Muda
  | 'kawasan_berkembang' // Magenta
  | 'komersil_lokal'    // Oranye
  | 'perumahan_menengah' // Merah
  | 'area_bisnis'       // Kuning
  | 'kawasan_elite'     // Hijau
  | 'kawasan_sultan';   // Biru Tua

export interface Tile {
  id: number; // 0 to 23
  name: string;
  type: TileType;
  description?: string;
  subtitle?: string;
  
  // Property attributes (if type === 'PROPERTY')
  group?: PropertyGroup;
  price?: number;
  baseRent?: number;
  housePrice?: number;
  houseRents?: number[]; // [1 house, 2 houses, 3 houses]
  ownerId?: string | null;
  houses?: number; // 0, 1, 2, 3

  // Fixed fee attributes (if TAX / PUNGLI)
  amount?: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cash: number;
  position: number; // 0 to 23
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
  isBot: boolean;
  hasOutJailCard: boolean;
}

export type CardActionType =
  | 'CASH_CHANGE'
  | 'MOVE_TO'
  | 'GO_TO_JAIL'
  | 'GET_OUT_JAIL_CARD'
  | 'PER_PROPERTY_FEE'
  | 'COLLECT_FROM_ALL'
  | 'PAY_ALL_PLAYERS';

export interface GameCard {
  id: string;
  title: string;
  description: string;
  flavorText: string;
  category: 'TAKDIR' | 'MUSIBAH';
  actionType: CardActionType;
  amount?: number;
  targetTileId?: number;
}

export type GamePhase =
  | 'SETUP'
  | 'WAITING_ROLL'
  | 'ROLLING'
  | 'MOVING'
  | 'TILE_ACTION' // Buying prompt, paying rent prompt, or card trigger
  | 'SHOWING_CARD'
  | 'UPGRADE_PROPERTIES'
  | 'GAME_OVER';

export interface GameLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger' | 'takdir' | 'musibah';
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  tiles: Tile[];
  dice: [number, number];
  isDouble: boolean;
  doubleStreak: number;
  phase: GamePhase;
  activeCard: GameCard | null;
  logs: GameLog[];
  round: number;
  winner: Player | null;
}
