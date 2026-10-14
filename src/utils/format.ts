import type { Player, Tile } from '../types/game';

export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(abs);
  
  return isNegative ? `-${formatted}` : formatted;
}

export function calculateNetWorth(player: Player, tiles: Tile[]): number {
  let total = player.cash;
  tiles.forEach(tile => {
    if (tile.ownerId === player.id) {
      total += tile.price || 0;
      if (tile.houses && tile.housePrice) {
        total += tile.houses * tile.housePrice;
      }
    }
  });
  return total;
}
