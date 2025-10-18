import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { OfflineBanner } from '@/components/OfflineBanner';

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <OfflineBanner />
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 bg-secondary/10 pb-20 md:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
};
