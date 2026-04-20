import { apiFetch } from './api';

export async function sendLowStockAlert(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await apiFetch('/api/notifications/low-stock', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return { ok: false, error: message };
  }
}
