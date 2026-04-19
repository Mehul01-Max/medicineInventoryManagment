import { useState, useEffect } from 'react';
import { Mail, Send, ExternalLink, Loader2, CheckCircle2, XCircle, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { getEmailConfig, saveEmailConfig, sendLowStockAlert, type EmailConfig } from '@/lib/emailService';
import { useAuth } from '@/contexts/AuthContext';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<EmailConfig>(getEmailConfig);
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Pre-fill recipient email from auth
  useEffect(() => {
    if (user?.email && !config.recipientEmail) {
      setConfig(prev => ({ ...prev, recipientEmail: user.email }));
    }
  }, [user?.email]);

  const updateConfig = (patch: Partial<EmailConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...patch };
      saveEmailConfig(next);
      return next;
    });
  };

  const handleToggle = (enabled: boolean) => {
    updateConfig({ enabled });
    toast(enabled ? 'Email notifications enabled' : 'Email notifications disabled', {
      icon: enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />,
    });
  };

  const handleTest = async () => {
    setSending(true);
    const result = await sendLowStockAlert(config);
    setSending(false);

    if (result.ok) {
      toast.success('Test email sent! Check your inbox.', {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    } else {
      toast.error(result.error, {
        icon: <XCircle className="h-4 w-4" />,
      });
    }
  };

  return (
    <section className="space-y-3">
      {/* Main toggle card */}
      <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-5 shadow-elevated">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold">Email alerts</h2>
            <p className="text-sm opacity-90 mt-0.5 leading-snug">
              Get notified when medicines drop below their reorder threshold.
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-white/30 ml-2 flex-shrink-0"
          />
        </div>
      </div>

      {/* Config panel */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-medium">Configure EmailJS</span>
          <span
            className={`text-xs text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            ▾
          </span>
        </button>

        {expanded && (
          <div className="px-4 pb-5 pt-1 space-y-4 border-t border-border/60 animate-fade-in">
            {/* Quick info */}
            <div className="rounded-xl bg-primary-soft p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                StockSmart uses{' '}
                <a
                  href="https://www.emailjs.com/"
                  target="_blank"
                  rel="noopener"
                  className="font-semibold text-primary underline underline-offset-2 inline-flex items-center gap-0.5"
                >
                  EmailJS <ExternalLink className="h-3 w-3" />
                </a>{' '}
                to send emails directly from your browser. Create a free account, set up a service &
                template, then paste your credentials below.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="notif-service-id" className="text-xs font-medium">
                  Service ID
                </Label>
                <Input
                  id="notif-service-id"
                  type="text"
                  placeholder="service_xxxxxxx"
                  value={config.serviceId}
                  onChange={e => updateConfig({ serviceId: e.target.value })}
                  className="h-10 text-sm rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notif-template-id" className="text-xs font-medium">
                  Template ID
                </Label>
                <Input
                  id="notif-template-id"
                  type="text"
                  placeholder="template_xxxxxxx"
                  value={config.templateId}
                  onChange={e => updateConfig({ templateId: e.target.value })}
                  className="h-10 text-sm rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notif-public-key" className="text-xs font-medium">
                  Public Key
                </Label>
                <Input
                  id="notif-public-key"
                  type="text"
                  placeholder="xxxxxxxxxxxxxx"
                  value={config.publicKey}
                  onChange={e => updateConfig({ publicKey: e.target.value })}
                  className="h-10 text-sm rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notif-recipient" className="text-xs font-medium">
                  Recipient email
                </Label>
                <Input
                  id="notif-recipient"
                  type="email"
                  placeholder="you@example.com"
                  value={config.recipientEmail}
                  onChange={e => updateConfig({ recipientEmail: e.target.value })}
                  className="h-10 text-sm rounded-xl"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full h-10 text-sm rounded-xl"
              disabled={sending || !config.serviceId || !config.templateId || !config.publicKey || !config.recipientEmail}
              onClick={handleTest}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send test email
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
