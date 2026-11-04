import { handleQuoteAttachmentInit } from '@/server/quote/handlers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  return handleQuoteAttachmentInit(request);
}
