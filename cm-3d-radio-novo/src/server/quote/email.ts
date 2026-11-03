import { QuoteHttpError, uuid } from './http';
import type { QuoteNotificationData } from './supabase-gateway';

const recipient = 'casman1986@gmail.com';

const labels: Record<string, string> = {
  kind: 'Tipo', mode: 'Modo', description: 'Descrição', shape: 'Formato',
  shapeOther: 'Outro formato', dividers: 'Divisórias', dividerCount: 'Quantidade de divisórias',
  dimensions: 'Medidas', dimensionsUnknown: 'Medidas desconhecidas',
  measurementBasis: 'Base das medidas', noPersonalization: 'Sem personalização',
  personalization: 'Personalização', text: 'Texto', qrSource: 'Origem do QR Code',
  qrContent: 'Conteúdo do QR Code', contentsUnknown: 'Conteúdo a definir',
  contents: 'Conteúdo', use: 'Uso', fixation: 'Colocação', scale: 'Escala',
  notes: 'Observações', size: 'Tamanho aproximado',
};

function display(value: unknown): string {
  if (Array.isArray(value)) return value.map(display).join(', ');
  if (value && typeof value === 'object') {
    return Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${key}: ${display(item)}`).join(' · ');
  }
  return String(value);
}

export function quoteEmailText(requestId: string, quote: QuoteNotificationData, siteOrigin: string): string {
  const details = Object.entries(quote.project)
    .filter(([, value]) => value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${labels[key] ?? key}: ${display(value)}`);
  const colors = quote.production.colorMode === 'indeciso' ? 'a definir' : display(quote.production.colors ?? []);
  const studioReference = quote.sourceReference?.startsWith('/api/studio/photos/')
    ? new URL(quote.sourceReference, siteOrigin).href : null;
  return [
    `Novo pedido de orçamento #${requestId}`,
    `Cliente: ${quote.contactName}`,
    `Contato (${quote.contactMethod}): ${quote.contactValue}`,
    `Projeto: ${quote.projectType}`,
    `Quantidade: ${display(quote.production.quantity)}`,
    `Cores: ${colors}`,
    `Entrega: ${display(quote.production.delivery)}${quote.production.cep ? `, CEP ${display(quote.production.cep)}` : ''}`,
    ...(studioReference ? [`Foto de referência do Estúdio: ${studioReference}`] : []),
    '', 'Detalhes:', ...details,
    '', `Arquivos: ${quote.attachmentNames.length ? quote.attachmentNames.join(', ') : 'nenhum'}`,
    'Os arquivos ficam no armazenamento privado do pedido; este e-mail não contém anexos.',
  ].join('\n');
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

export async function sendQuoteEmail(requestId: string, message: string, fetcher: typeof fetch = fetch): Promise<void> {
  if (!uuid(requestId) || message.length > 16000) throw new QuoteHttpError(400, 'invalid_quote_email');
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
        subject: `Novo orçamento CM 3D #${requestId.slice(0, 8)}`,
        text: message, messageId: `<quote-${requestId}@gmail.com>`,
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
        'Idempotency-Key': `quote/${requestId}`,
      },
      body: JSON.stringify({
        from, to: [recipient], subject: `Novo orçamento CM 3D #${requestId.slice(0, 8)}`,
        text: message,
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
