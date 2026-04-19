import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppShell = () => {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-md min-h-dvh pb-24 flex flex-col">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};
