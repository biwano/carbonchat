'use client';

import { useMutation } from '@tanstack/react-query';

export function useScrapeMutation(onSuccess?: () => void) {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/documents/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Scrape failed');
      return result;
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    mutationKey: ['scrape'], // Base key
  });
}
