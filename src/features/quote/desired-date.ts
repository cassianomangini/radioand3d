const saoPauloDateParts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function saoPauloToday(now: Date = new Date()): string {
  const parts = Object.fromEntries(saoPauloDateParts.formatToParts(now)
    .filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function realIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() + 1 === month && parsed.getUTCDate() === day;
}

export function validDesiredDate(value: string, now: Date = new Date()): boolean {
  return value === '' || (realIsoDate(value) && value >= saoPauloToday(now));
}

export function formatDesiredDate(value: unknown): string | null {
  if (typeof value !== 'string' || !realIsoDate(value)) return null;
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
