import { validModelLink } from './model-link';

export const MODEL_ITEM_LIMIT = 20;
export const MODEL_LINK_MAX_LENGTH = 350;
export const MODEL_NOTES_MAX_LENGTH = 140;
export const MODEL_TITLE_MAX_LENGTH = 80;

export type ModelColor = { name: string; rgb: string };
export type ModelDimensions = { width: string; depth: string; height: string };
export type ModelItem = {
  id: string;
  source: 'link' | 'file';
  link: string;
  fileName: string;
  title?: string;
  quantity: number;
  colorMode: 'tenho' | 'indeciso';
  colors: ModelColor[];
  scale: 'original' | 'alterar' | 'nao-sei';
  dimensions: ModelDimensions;
  notes: string;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fileName = /\.(?:stl|3mf)$/i;
const validSize = (value: string) => /^\d+(?:[.,]\d+)?$/.test(value.trim()) &&
  Number(value.trim().replace(',', '.')) > 0;

export function validModelItems(value: unknown): value is ModelItem[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > MODEL_ITEM_LIMIT) return false;
  const ids = new Set<string>();
  let units = 0;
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const entry = item as Record<string, unknown>;
    if (typeof entry.id !== 'string' || !uuid.test(entry.id) || ids.has(entry.id)) return false;
    ids.add(entry.id);
    if (entry.source !== 'link' && entry.source !== 'file') return false;
    if (typeof entry.link !== 'string' || typeof entry.fileName !== 'string' ||
        typeof entry.notes !== 'string' || entry.notes.length > MODEL_NOTES_MAX_LENGTH) return false;
    if (entry.title !== undefined &&
        (typeof entry.title !== 'string' || entry.title.length > MODEL_TITLE_MAX_LENGTH ||
         /[\u0000-\u001f\u007f]/.test(entry.title))) return false;
    if (entry.source === 'link' &&
      (entry.fileName !== '' || entry.link.length > MODEL_LINK_MAX_LENGTH || !validModelLink(entry.link))) return false;
    if (entry.source === 'file' &&
      (entry.link !== '' || entry.fileName.length < 1 || entry.fileName.length > 255 ||
       /[\u0000-\u001f\u007f]/.test(entry.fileName) || !fileName.test(entry.fileName))) return false;
    if (!Number.isSafeInteger(entry.quantity) || (entry.quantity as number) < 1 ||
        (entry.quantity as number) > 10000) return false;
    units += entry.quantity as number;
    if (units > 10000) return false;
    if (entry.colorMode !== 'tenho' && entry.colorMode !== 'indeciso') return false;
    if (!Array.isArray(entry.colors) || entry.colors.length > 4 ||
        !entry.colors.every((color) => color && typeof color === 'object' &&
          typeof color.name === 'string' && color.name.length <= 48 &&
          typeof color.rgb === 'string' &&
          (color.rgb === '' || /^#[0-9a-f]{6}$/i.test(color.rgb)))) return false;
    if (entry.colorMode === 'tenho' &&
        (entry.colors.length === 0 || !entry.colors.every(color => color.name.trim() || color.rgb))) return false;
    if (!['original', 'alterar', 'nao-sei'].includes(entry.scale as string)) return false;
    if (!entry.dimensions || typeof entry.dimensions !== 'object' || Array.isArray(entry.dimensions)) return false;
    const dims = entry.dimensions as Record<string, unknown>;
    if (!['width', 'depth', 'height'].every(key => typeof dims[key] === 'string' &&
        (dims[key] as string).length <= 24)) return false;
    if (entry.scale === 'alterar' &&
      (!['width', 'depth', 'height'].some(key => (dims[key] as string).trim()) ||
       !['width', 'depth', 'height'].every(key => !(dims[key] as string).trim() || validSize(dims[key] as string)))) return false;
  }
  return true;
}

/**
 * Draft restoration is intentionally more tolerant than submission validation:
 * a customer can reload while typing an incomplete link, color or dimension.
 * Only bounded, shape-safe data is restored; validateModelItems still controls submit.
 */
export function restorableModelItems(value: unknown): value is ModelItem[] {
  if (!Array.isArray(value) || value.length > MODEL_ITEM_LIMIT) return false;
  const seen = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
    const item = raw as Record<string, unknown>;
    if (typeof item.id !== 'string' || !uuid.test(item.id) || seen.has(item.id)) return false;
    seen.add(item.id);
    if (item.source !== 'link' && item.source !== 'file') return false;
    if (typeof item.link !== 'string' || item.link.length > MODEL_LINK_MAX_LENGTH ||
        typeof item.fileName !== 'string' || item.fileName.length > 255 ||
        typeof item.notes !== 'string' || item.notes.length > MODEL_NOTES_MAX_LENGTH ||
        /[\u0000-\u001f\u007f]/.test(item.fileName)) return false;
    if (item.title !== undefined &&
        (typeof item.title !== 'string' || item.title.length > MODEL_TITLE_MAX_LENGTH ||
         /[\u0000-\u001f\u007f]/.test(item.title))) return false;
    if (item.source === 'file' && !fileName.test(item.fileName)) return false;
    if (!Number.isSafeInteger(item.quantity) || (item.quantity as number) < 1 ||
        (item.quantity as number) > 10000) return false;
    if (item.colorMode !== 'tenho' && item.colorMode !== 'indeciso') return false;
    if (!Array.isArray(item.colors) || item.colors.length > 4 ||
        !item.colors.every(c => c && typeof c === 'object' &&
          typeof c.name === 'string' && c.name.length <= 48 &&
          typeof c.rgb === 'string' && (c.rgb === '' || /^#[0-9a-f]{6}$/i.test(c.rgb)))) return false;
    if (!['original','alterar','nao-sei'].includes(item.scale as string)) return false;
    if (!item.dimensions || typeof item.dimensions !== 'object' || Array.isArray(item.dimensions)) return false;
    if (!['width','depth','height'].every(key =>
      typeof (item.dimensions as Record<string, unknown>)[key] === 'string' &&
      ((item.dimensions as Record<string, string>)[key]).length <= 24)) return false;
  }
  return true;
}

export function modelUnits(items: readonly ModelItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
