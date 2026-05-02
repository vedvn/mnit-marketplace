import { NextRequest } from 'next/server';
import { runAIVerificationForProduct } from '@/lib/ai-verify-runner';

/**
 * POST /api/ai/verify-product
 *
 * Internal-only route. Can be used to manually retry a failed AI verification
 * from the admin panel. Normal flow uses after() in market-actions.ts directly.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await request.json();
    if (!productId) {
      return Response.json({ error: 'Missing productId' }, { status: 400 });
    }

    await runAIVerificationForProduct(productId);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error('[AIVerify Route] Error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
