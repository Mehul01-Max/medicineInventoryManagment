import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Bell, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarded } from '@/lib/useStore';

const Welcome = () => {
  const navigate = useNavigate();
  const [, setOnboarded] = useOnboarded();

  const handleStart = () => {
    setOnboarded(true);
    navigate('/inventory/add');
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <main className="flex-1 mx-auto max-w-md w-full px-6 py-10 flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-elevated mb-6">
            <span className="text-3xl font-bold leading-none">+</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Never run out of medicine.
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            StockSmart watches your inventory and tells you exactly what to reorder — so your shelves stay full without the guesswork.
          </p>

          <ul className="mt-8 space-y-4">
            <Feature
              icon={<Bell className="h-5 w-5" />}
              title="Low stock alerts"
              description="See critical items the moment they drop below your minimum."
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Smart reorder suggestions"
              description="Based on your daily sales — no guesswork, no AI hype."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Works offline"
              description="Use it at the counter even when the internet is slow."
            />
          </ul>
        </div>

        <div className="mt-10 space-y-3">
          <Button onClick={handleStart} size="lg" className="w-full h-14 text-base font-semibold">
            Add my first medicine
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <button
            type="button"
            onClick={() => {
              setOnboarded(true);
              navigate('/');
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
          >
            Skip for now
          </button>
        </div>
      </main>
    </div>
  );
};

const Feature = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <li className="flex gap-3">
    <span className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
      {icon}
    </span>
    <div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{description}</p>
    </div>
  </li>
);

export default Welcome;
