import type { Draft } from '@/app/orcamentos/quote-flow';
import { validateQuoteFiles } from '@/features/quote/file-policy';
import { uuid } from './http';
import type { QuoteProjectType } from './supabase-gateway';

export type QuoteAttachmentInput = {
  id: string;
  role: 'model' | 'logo' | 'qr' | 'boxLogo' | 'boxQr' | 'references';
  name: string;
  size: number;
  type: string;
};

const textFields = [
  'boxMode', 'boxQuickDescription', 'boxShape', 'boxShapeOther', 'boxDividers',
  'boxDividerCount', 'boxBasis', 'boxText', 'boxQrSource', 'boxQrContent',
  'plateMode', 'plateQuickDescription', 'plateText', 'plateQrSource', 'plateQrContent',
  'plateUse', 'plateFixation', 'modelScale', 'modelNotes', 'otherDescription',
  'otherSize', 'colorMode', 'name', 'contactMethod', 'contact', 'delivery', 'cep',
] as const;
const booleanFields = [
  'boxUnknown', 'boxNoPersonalization', 'plateContentUnknown', 'plateUseUnknown',
  'plateFixationUnknown', 'plateUnknown', 'modelScaleUnknown',
] as const;
const dimensionFields = ['boxDimensions', 'plateDimensions', 'modelDimensions'] as const;
const listFields = ['boxPersonalization', 'plateContents'] as const;
const fileRoles = ['model', 'logo', 'qr', 'boxLogo', 'boxQr', 'references'] as const;
const imageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function oneOf(value: unknown, options: readonly string[]): boolean {
  return typeof value === 'string' && options.includes(value);
}

function dimension(value: unknown): boolean {
  return object(value) && ['width', 'depth', 'height'].every(
    key => typeof value[key] === 'string' && value[key].length <= 24,
  );
}

function validDimension(value: string): boolean {
  const normalized = value.trim().replace(',', '.');
  return /^\d+(?:\.\d+)?$/.test(normalized) && Number(normalized) > 0;
}

function hasColors(draft: Draft): boolean {
  return draft.colorMode === 'indeciso' || (
    draft.colorMode === 'tenho' && draft.colors.length >= 1 && draft.colors.length <= 4 &&
    draft.colors.every(color => color.name.trim() || color.rgb)
  );
}

function fileByRole(files: QuoteAttachmentInput[], role: QuoteAttachmentInput['role']): boolean {
  return files.some(file => file.role === role);
}

export function parseQuoteForm(value: unknown): Draft | null {
  if (!object(value) || !oneOf(value.type, ['caixa', 'placa', 'arquivo', 'outro']) ||
      !Number.isSafeInteger(value.quantity) || (value.quantity as number) < 1 ||
      (value.quantity as number) > 10000) return null;
  if (value.studioPhotoId != null &&
      (typeof value.studioPhotoId !== 'string' || value.studioPhotoId.length > 260 ||
       !/^[A-Za-z0-9_-]+\.[a-f0-9]{32}\.[a-f0-9]{32}$/.test(value.studioPhotoId))) return null;
  for (const key of textFields) {
    if (typeof value[key] !== 'string' || value[key].length > 2000) return null;
  }
  for (const key of booleanFields) if (typeof value[key] !== 'boolean') return null;
  for (const key of dimensionFields) if (!dimension(value[key])) return null;
  for (const key of listFields) {
    const list = value[key];
    if (!Array.isArray(list) || list.length > 12 ||
        !list.every(item => typeof item === 'string' && item.length <= 80)) return null;
  }
  if (!Array.isArray(value.colors) || value.colors.length > 4 ||
      !value.colors.every(color => object(color) &&
        typeof color.name === 'string' && color.name.length <= 80 &&
        typeof color.rgb === 'string' && (color.rgb === '' || /^#[0-9a-f]{6}$/i.test(color.rgb)))) return null;
  if (!oneOf(value.contactMethod, ['whatsapp', 'email']) ||
      !oneOf(value.delivery, ['retirada', 'envio']) ||
      !oneOf(value.boxMode, ['', 'quick', 'detailed']) ||
      !oneOf(value.plateMode, ['', 'quick', 'detailed']) ||
      !oneOf(value.boxDividers, ['', 'com', 'sem', 'nao-sei']) ||
      !oneOf(value.colorMode, ['', 'tenho', 'indeciso']) ||
      !oneOf(value.boxQrSource, ['', 'content', 'file']) ||
      !oneOf(value.plateQrSource, ['', 'content', 'file'])) return null;
  return value as Draft;
}

export function parseQuoteAttachments(value: unknown): QuoteAttachmentInput[] | null {
  if (!Array.isArray(value) || value.length > 5) return null;
  const files: QuoteAttachmentInput[] = [];
  for (const item of value) {
    if (!object(item) || !uuid(item.id) || !oneOf(item.role, fileRoles) ||
        typeof item.name !== 'string' || item.name.length < 1 || item.name.length > 255 ||
        /[\u0000-\u001f\u007f]/.test(item.name) ||
        !Number.isSafeInteger(item.size) || (item.size as number) < 1 ||
        typeof item.type !== 'string' || item.type.length > 120) return null;
    const extension = item.name.split('.').pop()?.toLowerCase() ?? '';
    const allowed = item.role === 'model' ? ['stl', '3mf'] : imageExtensions;
    if (!allowed.includes(extension)) return null;
    files.push(item as QuoteAttachmentInput);
  }
  if (new Set(files.map(file => file.id)).size !== files.length ||
      !validateQuoteFiles(files).ok ||
      fileRoles.slice(0, -1).some(role => files.filter(file => file.role === role).length > 1)) return null;
  return files;
}

export function validateQuoteForm(draft: Draft, files: QuoteAttachmentInput[]): boolean {
  if (!draft.name.trim() || draft.name.length > 160 || draft.contact.length > 320 ||
      (draft.contactMethod === 'email'
        ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact.trim())
        : !/^\d{10,13}$/.test(draft.contact.replace(/\D/g, ''))) ||
      (draft.delivery === 'envio' && draft.cep.replace(/\D/g, '').length !== 8)) return false;

  const allowedRoles: Record<NonNullable<Draft['type']>, QuoteAttachmentInput['role'][]> = {
    caixa: ['boxLogo', 'boxQr', 'references'], placa: ['logo', 'qr', 'references'],
    arquivo: ['model'], outro: ['references'],
  };
  if (files.some(file => !allowedRoles[draft.type!].includes(file.role))) return false;

  if (draft.type === 'caixa') {
    if (draft.boxMode === 'quick') return Boolean(draft.boxQuickDescription.trim() || fileByRole(files, 'references'));
    if (draft.boxMode !== 'detailed' ||
        !oneOf(draft.boxShape, ['Redonda', 'Quadrada', 'Retangular', 'Outro formato']) ||
        !oneOf(draft.boxDividers, ['com', 'sem', 'nao-sei']) ||
        (draft.boxDividers === 'com' && !draft.boxDividerCount.trim()) ||
        (!draft.boxUnknown && (!Object.values(draft.boxDimensions).every(validDimension) ||
          !oneOf(draft.boxBasis, ['internas', 'externas', 'nao-sei']))) ||
        (!draft.boxNoPersonalization && draft.boxPersonalization.length === 0) ||
        (!draft.boxNoPersonalization && draft.boxPersonalization.includes('Nome ou frase') && !draft.boxText.trim()) ||
        (!draft.boxNoPersonalization && draft.boxPersonalization.includes('QR Code') &&
          ((draft.boxQrSource === 'content' && !draft.boxQrContent.trim()) ||
           (draft.boxQrSource === 'file' && !fileByRole(files, 'boxQr')) || !draft.boxQrSource)) ||
        (!draft.boxNoPersonalization && draft.boxPersonalization.includes('Imagem ou desenho') && !fileByRole(files, 'references')) ||
        (draft.boxShape === 'Outro formato' && !draft.boxShapeOther.trim() &&
          !draft.boxPersonalization.includes('Imagem ou desenho'))) return false;
    return hasColors(draft);
  }
  if (draft.type === 'placa') {
    if (draft.plateMode === 'quick') return Boolean(draft.plateQuickDescription.trim() || fileByRole(files, 'references'));
    if (draft.plateMode !== 'detailed' ||
        (!draft.plateContentUnknown && draft.plateContents.length === 0) ||
        (!draft.plateContentUnknown && draft.plateContents.includes('Nome ou frase') && !draft.plateText.trim()) ||
        (!draft.plateContentUnknown && draft.plateContents.includes('QR Code') &&
          ((draft.plateQrSource === 'content' && !draft.plateQrContent.trim()) ||
           (draft.plateQrSource === 'file' && !fileByRole(files, 'qr')) || !draft.plateQrSource)) ||
        (!draft.plateUseUnknown && !draft.plateUse.trim()) ||
        (!draft.plateFixationUnknown && !draft.plateFixation.trim()) ||
        (!draft.plateUnknown && ![draft.plateDimensions.width, draft.plateDimensions.height].every(validDimension))) return false;
    return hasColors(draft);
  }
  if (draft.type === 'arquivo') {
    if (!fileByRole(files, 'model') || (!draft.modelScaleUnknown && !oneOf(draft.modelScale, ['original', 'alterar'])) ||
        (!draft.modelScaleUnknown && draft.modelScale === 'alterar' &&
          (!Object.values(draft.modelDimensions).some(value => value.trim()) ||
            Object.values(draft.modelDimensions).some(value => value.trim() && !validDimension(value))))) return false;
    return hasColors(draft);
  }
  if (draft.studioPhotoId && !draft.otherDescription.trim()) return false;
  return Boolean((draft.otherDescription.trim() || fileByRole(files, 'references')) && hasColors(draft));
}

export function prepareQuoteForStorage(draft: Draft, files: QuoteAttachmentInput[]) {
  const projectType: QuoteProjectType = draft.type === 'arquivo' ? 'impressao' : draft.type!;
  const mode = draft.type === 'caixa' ? draft.boxMode : draft.type === 'placa' ? draft.plateMode : '';
  const production = {
    quantity: draft.quantity, colorMode: draft.colorMode,
    colors: mode === 'quick' ? [] : draft.colors.filter(color => color.name.trim() || color.rgb),
    delivery: draft.delivery, cep: draft.delivery === 'envio' ? draft.cep.trim() : null,
  };
  const project = draft.type === 'caixa' ? {
    kind: 'caixa', mode, description: mode === 'quick' ? draft.boxQuickDescription.trim() : null,
    shape: mode === 'detailed' ? draft.boxShape : null,
    shapeOther: mode === 'detailed' ? draft.boxShapeOther.trim() : null,
    dividers: mode === 'detailed' ? draft.boxDividers : null,
    dividerCount: mode === 'detailed' ? draft.boxDividerCount.trim() : null,
    dimensions: mode === 'detailed' && !draft.boxUnknown ? draft.boxDimensions : null,
    dimensionsUnknown: mode === 'detailed' ? draft.boxUnknown : null,
    measurementBasis: mode === 'detailed' && !draft.boxUnknown ? draft.boxBasis : null,
    noPersonalization: mode === 'detailed' ? draft.boxNoPersonalization : null,
    personalization: mode === 'detailed' && !draft.boxNoPersonalization ? draft.boxPersonalization : [],
    text: mode === 'detailed' && draft.boxPersonalization.includes('Nome ou frase') ? draft.boxText.trim() : null,
    qrSource: mode === 'detailed' && draft.boxPersonalization.includes('QR Code') ? draft.boxQrSource : null,
    qrContent: mode === 'detailed' && draft.boxQrSource === 'content' ? draft.boxQrContent.trim() : null,
  } : draft.type === 'placa' ? {
    kind: 'placa', mode, description: mode === 'quick' ? draft.plateQuickDescription.trim() : null,
    contentsUnknown: mode === 'detailed' ? draft.plateContentUnknown : null,
    contents: mode === 'detailed' && !draft.plateContentUnknown ? draft.plateContents : [],
    text: mode === 'detailed' && draft.plateContents.includes('Nome ou frase') ? draft.plateText.trim() : null,
    qrSource: mode === 'detailed' && draft.plateContents.includes('QR Code') ? draft.plateQrSource : null,
    qrContent: mode === 'detailed' && draft.plateQrSource === 'content' ? draft.plateQrContent.trim() : null,
    use: mode === 'detailed' && !draft.plateUseUnknown ? draft.plateUse : null,
    fixation: mode === 'detailed' && !draft.plateFixationUnknown ? draft.plateFixation.trim() : null,
    dimensions: mode === 'detailed' && !draft.plateUnknown ? draft.plateDimensions : null,
  } : draft.type === 'arquivo' ? {
    kind: 'impressao', scale: draft.modelScaleUnknown ? 'a definir' : draft.modelScale,
    dimensions: !draft.modelScaleUnknown && draft.modelScale === 'alterar' ? draft.modelDimensions : null,
    notes: draft.modelNotes.trim(),
  } : { kind: 'outro', description: draft.otherDescription.trim(), size: draft.otherSize.trim() };
  const needsInformation = mode === 'quick' || draft.colorMode === 'indeciso' ||
    draft.boxUnknown || draft.plateUnknown || draft.modelScaleUnknown ||
    draft.plateContentUnknown || draft.plateUseUnknown || draft.plateFixationUnknown;
  return {
    projectType, noFile: files.length === 0,
    startingPoints: [mode === 'quick' ? 'pedido rápido' : mode === 'detailed' ? 'formulário detalhado' : 'formulário',
      ...(draft.studioPhotoId ? ['foto do estúdio'] : [])],
    sourceOrigin: draft.studioPhotoId ? 'site/estudio' : 'site/orcamentos',
    sourceReference: draft.studioPhotoId ? `/api/studio/photos/${draft.studioPhotoId}` : null,
    production, project, contactMethod: draft.contactMethod,
    contactName: draft.name.trim(), contactValue: draft.contact.trim(),
    triageStatus: needsInformation ? 'needs-information' as const : 'ready-for-review' as const,
    attachmentIds: files.map(file => file.id),
  };
}

