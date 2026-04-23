'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Credits = {
  total_credits: number;
  total_usage: number;
  remaining_credits: number;
};

export default function StatsPanel() {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/openrouter/credits');
      const body = (await res.json()) as { error?: string } & Partial<Credits>;
      if (!res.ok) {
        throw new Error(body.error || 'Failed to load');
      }
      setCredits({
        total_credits: body.total_credits!,
        total_usage: body.total_usage!,
        remaining_credits: body.remaining_credits!,
      });
    } catch (e) {
      setCredits(null);
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Stats</h2>
          <p className="text-sm text-muted-foreground">OpenRouter credits</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-muted-foreground">Total</p>
              <p className="text-xl font-semibold tabular-nums">
                {loading
                  ? '…'
                  : credits
                    ? credits.total_credits.toLocaleString()
                    : '—'}
              </p>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-muted-foreground">Used</p>
              <p className="text-xl font-semibold tabular-nums">
                {loading
                  ? '…'
                  : credits
                    ? credits.total_usage.toLocaleString()
                    : '—'}
              </p>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-muted-foreground">Remaining</p>
              <p className="text-xl font-semibold tabular-nums">
                {loading
                  ? '…'
                  : credits
                    ? credits.remaining_credits.toLocaleString()
                    : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
