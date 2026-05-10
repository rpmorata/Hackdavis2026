import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, Mic, Pill, User } from 'lucide-react';

const navItems = [
  { path: '/home', label: 'Home', Icon: Home },
  { path: '/session', label: 'Session', Icon: Mic },
  { path: '/medication', label: 'Meds', Icon: Pill },
  { path: '/profile', label: 'Profile', Icon: User },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="flex flex-col h-screen max-w-[480px] mx-auto relative bg-background"
    >
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {/* Bottom navigation */}
      <nav
        className="shrink-0 bg-card border-t border-border flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--muted-foreground)',
                minHeight: 56,
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
