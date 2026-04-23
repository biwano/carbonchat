import { NextResponse } from 'next/server';

const URL = 'https://openrouter.ai/api/v1/credits';

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Set OPENROUTER_MANAGEMENT_KEY or OPENROUTER_API_KEY' },
      { status: 503 }
    );
  }

  let res: Response;
  try {
    res = await fetch(URL, {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Could not reach OpenRouter' }, { status: 502 });
  }
  const json = (await res.json().catch(() => ({}))) as {
    data?: { total_credits: number; total_usage: number };
    error?: { message?: string };
  };

  if (!res.ok) {
    return NextResponse.json(
      { error: json.error?.message ?? res.statusText },
      { status: res.status }
    );
  }

  const { total_credits, total_usage } = json.data ?? {};
  if (typeof total_credits !== 'number' || typeof total_usage !== 'number') {
    return NextResponse.json(
      { error: 'Bad response from OpenRouter' },
      { status: 502 }
    );
  }

  return NextResponse.json({
    total_credits,
    total_usage,
    remaining_credits: total_credits - total_usage,
  });
}
