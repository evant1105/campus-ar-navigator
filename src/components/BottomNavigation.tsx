import React, { forwardRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, Navigation, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/map', icon: Map, label: 'Map' },
  { path: '/ar', icon: Navigation, label: 'AR' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNavigation = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
      <nav 
        ref={ref}
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50"
        {...props}
      >
        <div className="flex items-center justify-around h-18 py-3 max-w-md mx-auto px-4">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full transition-colors gap-1",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }
);

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;
