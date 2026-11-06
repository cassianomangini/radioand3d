import { handleQuoteRetention } from '@/server/quote/retention-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Cleanup may use 25 seconds; reserve time for aggregate metrics and email alerts.
export const maxDuration = 60;

// Vercel calls this route with CRON_SECRET; the handler also fails closed without it.
export async function GET(request: Request): Promise<Response> {
  return handleQuoteRetention(request);
}
