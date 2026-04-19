// StockSmart Email Notification Service — powered by EmailJS
import emailjs from '@emailjs/browser';
import { store, getStockStatus, type Medicine } from './storage';

export type EmailConfig = {
  enabled: boolean;
  serviceId: string;
  templateId: string;
  publicKey: string;
  recipientEmail: string;
};

const KEY = 'stocksmart.emailconfig.v1';

const DEFAULT_CONFIG: EmailConfig = {
  enabled: false,
  serviceId: '',
  templateId: '',
  publicKey: '',
  recipientEmail: '',
};

export function getEmailConfig(): EmailConfig {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveEmailConfig(config: EmailConfig) {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function clearEmailConfig() {
  localStorage.removeItem(KEY);
}

/** Build a readable list of low-stock medicines */
function buildLowStockSummary(medicines: Medicine[]): string {
  const lowStock = medicines.filter(m => {
    const status = getStockStatus(m);
    return status === 'critical' || status === 'low';
  });

  if (lowStock.length === 0) return '';

  return lowStock
    .map(m => {
      const status = getStockStatus(m);
      const emoji = status === 'critical' ? '🔴' : '🟡';
      return `${emoji} ${m.name} — ${m.stock} ${m.unit || 'units'} left (threshold: ${m.threshold})`;
    })
    .join('\n');
}

/** Send a low-stock alert email using configured EmailJS credentials */
export async function sendLowStockAlert(
  config?: EmailConfig
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = config ?? getEmailConfig();

  if (!cfg.serviceId || !cfg.templateId || !cfg.publicKey || !cfg.recipientEmail) {
    return { ok: false, error: 'Email configuration is incomplete. Please fill in all fields.' };
  }

  const medicines = store.getMedicines();
  const summary = buildLowStockSummary(medicines);

  if (!summary) {
    return { ok: false, error: 'No low-stock items to report. All medicines are above threshold.' };
  }

  const criticalCount = medicines.filter(m => getStockStatus(m) === 'critical').length;
  const lowCount = medicines.filter(m => getStockStatus(m) === 'low').length;

  try {
    await emailjs.send(
      cfg.serviceId,
      cfg.templateId,
      {
        to_email: cfg.recipientEmail,
        subject: `⚠️ StockSmart Alert: ${criticalCount + lowCount} medicine(s) running low`,
        message: `StockSmart Low-Stock Report\n${'─'.repeat(35)}\n\n${summary}\n\n${'─'.repeat(35)}\nCritical: ${criticalCount} | Low: ${lowCount} | Total medicines: ${medicines.length}\n\nPlease reorder these items soon to avoid stockouts.\n\n— StockSmart`,
      },
      cfg.publicKey
    );
    return { ok: true };
  } catch (err: any) {
    const msg = err?.text || err?.message || 'Failed to send email. Check your EmailJS configuration.';
    return { ok: false, error: msg };
  }
}

/** Check inventory and send notification if enabled and items are low */
export async function checkAndNotify(): Promise<void> {
  const config = getEmailConfig();
  if (!config.enabled) return;

  const medicines = store.getMedicines();
  const hasLow = medicines.some(m => {
    const status = getStockStatus(m);
    return status === 'critical' || status === 'low';
  });

  if (hasLow) {
    await sendLowStockAlert(config);
  }
}
