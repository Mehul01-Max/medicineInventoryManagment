import { useState } from 'react';
import { Mail, Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sendLowStockAlert } from '@/lib/emailService';
import { useAuth } from '@/contexts/AuthContext';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    const result = await sendLowStockAlert();
    setSending(false);

    if (result.ok) {
      toast.success('Low-stock alert sent to your email!', {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    } else {
      const errResult = result as { ok: false; error: string };
      toast.error(errResult.error, {
        icon: <XCircle className="h-4 w-4" />,
      });
    }
  };

  return (
    <section className="space-y-3">
      <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-5 shadow-elevated">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold">Email alerts</h2>
            <p className="text-sm opacity-90 mt-0.5 leading-snug">
              Get a low-stock report sent to <strong>{user?.email}</strong> whenever medicines drop below their threshold.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full h-10 text-sm rounded-xl"
          disabled={sending}
          onClick={handleSend}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send low-stock alert
        </Button>
      </div>
    </section>
  );
};
