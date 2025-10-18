import { NavLink } from 'react-router-dom';
import { Home, MapPin, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
  const navItems = [
    { to: '/dashboard/destinations', icon: Home, label: 'Home' },
    { to: '/dashboard/destinations', icon: MapPin, label: 'Destinations' },
    { to: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                'min-w-[44px] min-h-[44px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
