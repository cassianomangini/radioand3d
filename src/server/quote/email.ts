import { createHash } from 'node:crypto';
import { QuoteHttpError, uuid } from './http';
import type { QuoteNotificationData } from './supabase-gateway';
import { validModelLink } from '@/features/quote/model-link';

const recipient = 'casman1986@gmail.com';

const labels: Record<string, string> = {
  kind: 'Tipo', mode: 'Modo', description: 'Descrição', shape: 'Formato',
  shapeOther: 'Outro formato', dividers: 'Divisórias', dividerCount: 'Quantidade de divisórias',
  dimensions: 'Medidas', dimensionsUnknown: 'Medidas desconhecidas',
  measurementBasis: 'Base das medidas', noPersonalization: 'Sem personalização',
  personalization: 'Personalização', text: 'Texto', qrSource: 'Origem do QR Code',
  qrContent: 'Conteúdo do QR Code', contentsUnknown: 'Conteúdo a definir',
  contents: 'Conteúdo', use: 'Uso', fixation: 'Colocação', scale: 'Escala',
  notes: 'Observações', size: 'Tamanho aproximado', modelLink: 'Link do modelo',
};

function display(value: unknown): string {
  if (Array.isArray(value)) return value.map(display).join(', ');
  if (value && typeof value === 'object') {
    return Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${key}: ${display(item)}`).join(' · ');
  }
  return String(value);
}

type EmailLine = string | { name: string; url: string };
export type QuoteEmailMessage = { text: string; html: string };

function quoteEmailLines(requestId: string, quote: QuoteNotificationData, siteOrigin: string): EmailLine[] {
  const items = quote.project.kind === 'impressao' && Array.isArray(quote.project.items) ?
    quote.project.items as Array<Record<string, unknown>> : null;
  const details = Object.entries(quote.project)
    .filter(([key, value]) => (!items || !['items', 'modelLink'].includes(key)) &&
      value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]): EmailLine => key === 'modelLink' && typeof value === 'string' && validModelLink(value)
      ? { name: 'Link do modelo', url: value.trim() }
      : `${labels[key] ?? key}: ${display(value)}`);
  const modelLines: EmailLine[] = [];
  if (items) {
    modelLines.push(`Modelos: ${items.length}`);
    for (const [index, item] of items.entries()) {
      const quantity = Number(item.quantity);
      modelLines.push('', `Modelo ${String(index + 1).padStart(2, '0')} · ${quantity} unidade(s)`);
      if (typeof item.title === 'string' && item.title.trim()) modelLines.push(`Nome: ${item.title.trim()}`);
      if (item.source === 'link' && typeof item.link === 'string' && validModelLink(item.link)) {
        modelLines.push({ name: 'Abrir modelo no MakerWorld/Bambu', url: item.link });
      } else if (item.source === 'file') {
        const file = quote.attachments.find(file => file.id === item.attachmentId);
        if (!file) throw new QuoteHttpError(503, 'quote_email_attachment_missing');
        modelLines.push({ name: file.name, url: file.url });
      } else throw new QuoteHttpError(503, 'quote_email_model_invalid');
      modelLines.push(`Cores: ${item.colorMode === 'indeciso' ? 'a definir' : display(item.colors ?? [])}`);
      modelLines.push(`Tamanho: ${item.scale === 'nao-sei' ? 'a definir' : item.scale === 'alterar' ? display(item.dimensions) : 'original'}`);
      if (typeof item.notes === 'string' && item.notes.trim()) modelLines.push(`Observações: ${item.notes.trim()}`);
    }
  }
  const colors = quote.production.colorMode === 'indeciso' ? 'a definir' : display(quote.production.colors ?? []);
  const studioReference = quote.sourceReference?.startsWith('/api/studio/photos/')
    ? new URL(quote.sourceReference, siteOrigin).href : null;
  return [
    `Novo pedido de orçamento #${requestId}`,
    `Cliente: ${quote.contactName}`,
    `Contato (${quote.contactMethod}): ${quote.contactValue}`,
    `Projeto: ${quote.projectType}`,
    `Quantidade total: ${display(quote.production.quantity)}`,
    ...(items ? [] : [`Cores: ${colors}`]),
    `Entrega: ${display(quote.production.delivery)}${quote.production.cep ? `, CEP ${display(quote.production.cep)}` : ''}`,
    ...(studioReference ? [{ name: 'Foto de referência do Estúdio', url: studioReference }] : []),
    '', 'Detalhes:', ...details, ...modelLines,
    '', 'Arquivos enviados:',
    ...(quote.attachments.length ? quote.attachments : ['nenhum']),
    ...(quote.attachments.length ? ['Links diretos disponíveis por até 90 dias após o pedido.'] : []),
  ];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char] ?? char);
}

export function quoteEmailText(requestId: string, quote: QuoteNotificationData, siteOrigin: string): string {
  return quoteEmailLines(requestId, quote, siteOrigin)
    .map(line => typeof line === 'string' ? line : `${line.name}: ${line.url}`).join('\n');
}

export function quoteEmailMessage(requestId: string, quote: QuoteNotificationData, siteOrigin: string): QuoteEmailMessage {
  const lines = quoteEmailLines(requestId, quote, siteOrigin);
  return {
    text: lines.map(line => typeof line === 'string' ? line : `${line.name}: ${line.url}`).join('\n'),
    html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.5">${lines.map(line =>
      typeof line === 'string' ? escapeHtml(line) :
        `<a href="${escapeHtml(line.url)}">${escapeHtml(line.name)}</a>`
    ).join('\n')}</div>`,
  };
}

type EmailConfig = { provider: 'gmail'; password: string } | { provider: 'resend'; key: string; from: string };

export function requireQuoteEmailConfig(): EmailConfig {
  const password = process.env.CM_QUOTE_GMAIL_APP_PASSWORD?.replace(/\s/g, '') ?? '';
  if (/^[a-z0-9]{16}$/i.test(password)) return { provider: 'gmail', password };
  const key = process.env.RESEND_API_KEY?.trim() ?? '';
  const from = process.env.CM_QUOTE_EMAIL_FROM?.trim() ?? '';
  if (!key.startsWith('re_') || key.length < 20 ||
      from.length > 200 || !/^[^\r\n<>]+ <[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>$/.test(from)) {
    throw new QuoteHttpError(503, 'quote_email_configuration_missing');
  }
  return { provider: 'resend', key, from };
}

export async function sendQuoteEmail(requestId: string, message: QuoteEmailMessage, fetcher: typeof fetch = fetch): Promise<void> {
  if (!uuid(requestId) || message.text.length > 60000 || message.html.length > 100000) {
    throw new QuoteHttpError(400, 'invalid_quote_email');
  }
  return sendNotification(
    `Novo orçamento CM 3D #${requestId.slice(0, 8)}`,
    `quote/${requestId}`, `<quote-${requestId}@gmail.com>`, message, fetcher,
  );
}

/** Aggregate operational alert only; no names, file paths or quote contents. */
export async function sendQuoteOperationsAlert(dayUtc: string, lines: string[], fetcher: typeof fetch = fetch): Promise<void> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayUtc) || lines.length > 20 ||
      lines.some(line => line.length > 200 || /[\r\n<>]/.test(line))) {
    throw new QuoteHttpError(400, 'invalid_quote_email');
  }
  const text = ['Alerta operacional dos orçamentos CM 3D', `Dia UTC: ${dayUtc}`, '', ...lines].join('\n');
  const digest = createHash('sha256').update(text).digest('hex').slice(0, 16);
  await sendNotification(
    `Alerta operacional de orçamentos CM 3D (${dayUtc})`,
    `quote/operations/${dayUtc}/${digest}`, `<quote-operations-${dayUtc}-${digest}@gmail.com>`,
    { text, html: `<div style="white-space:pre-wrap;font-family:Arial,sans-serif">${escapeHtml(text)}</div>` },
    fetcher,
  );
}

async function sendNotification(subject: string, idempotencyKey: string, messageId: string,
  message: QuoteEmailMessage, fetcher: typeof fetch): Promise<void> {
  const config = requireQuoteEmailConfig();
  if (config.provider === 'gmail') {
    const { default: nodemailer } = await import('nodemailer');
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: recipient, pass: config.password },
      connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
    });
    try {
      const result = await transport.sendMail({
        from: `CM 3D <${recipient}>`, to: recipient,
        subject, text: message.text, html: message.html, messageId,
      });
      if (!result.accepted.some(address => address.toLowerCase() === recipient)) {
        throw new QuoteHttpError(503, 'quote_email_unavailable');
      }
      return;
    } catch {
      throw new QuoteHttpError(503, 'quote_email_unavailable');
    } finally {
      transport.close();
    }
  }
  const { key, from } = config;
  let response: Response;
  try {
    response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from, to: [recipient], subject,
        text: message.text, html: message.html,
      }),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new QuoteHttpError(503, 'quote_email_unavailable');
  }
  if (!response.ok) throw new QuoteHttpError(503, 'quote_email_unavailable');
  const result = await response.json().catch(() => null) as { id?: unknown } | null;
  if (!result || typeof result.id !== 'string' || !uuid(result.id)) {
    throw new QuoteHttpError(503, 'quote_email_unavailable');
  }
}
