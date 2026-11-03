import { handleQuoteRetention } from '@/server/quote/retention-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cron is deliberately not scheduled in vercel.json until CRON_SECRET,
// private Supabase credentials and real Storage deletion are smoke-tested.
export async function GET(request: Request): Promise<Response> {
  return handleQuoteRetention(request);
}
