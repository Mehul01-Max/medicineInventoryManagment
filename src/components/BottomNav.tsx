import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/home', label: 'Home', icon: Home, end: true },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/more', label: 'More', icon: Settings },
];

export const BottomNav = () => {
  const location = useLocation();
  // hide nav on onboarding & auth pages
  const hidden = ['/welcome', '/login', '/signup'];
  if (hidden.includes(location.pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border safe-bottom"
      aria-label="Primary"
    >
      <ul className="mx-auto max-w-md grid grid-cols-4">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex items-center justify-center h-9 w-12 rounded-full transition-colors',
                      isActive && 'bg-primary-soft'
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
