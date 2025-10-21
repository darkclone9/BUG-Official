'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Trophy,
  BarChart3,
  Users,
  ShoppingBag,
  MessageCircle,
  User,
  Settings,
  ChevronRight,
  ChevronLeft,
  Gamepad2,
  Search,
  Calendar,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: Trophy, requiresAuth: true },
  { name: 'Messages', href: '/messages', icon: MessageCircle, requiresAuth: true },
  { name: 'Profile', href: '/profile', icon: User, requiresAuth: true },
  { name: 'Tournaments', href: '/tournaments', icon: Gamepad2 },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Quests', href: '/quests', icon: Target, requiresAuth: true },
  { name: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
  { name: 'Players', href: '/players', icon: Users },
  { name: 'Shop', href: '/shop', icon: ShoppingBag },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Admin', href: '/admin', icon: Settings, adminOnly: true, requiresAuth: true },
  { name: 'Admin Quests', href: '/admin/quests', icon: Target, adminOnly: true, requiresAuth: true },
];

export default function CollapsibleSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show sidebar on landing page
  const isLandingPage = pathname === '/';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render on server or on landing page
  if (!isMounted || isLandingPage) {
    return null;
  }

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.requiresAuth && !user) return false;
    return true;
  });

  // Update profile link to include user ID
  const processedNavItems = filteredNavItems.map(item => {
    if (item.href === '/profile' && user) {
      return { ...item, href: `/profile/${user.uid}` };
    }
    return item;
  });

  return (
    <>
      {/* Sidebar - Hidden on mobile (< 768px), visible on tablet and desktop */}
      <div
        className={cn(
          'hidden md:fixed left-0 top-0 h-screen bg-background/95 backdrop-blur-md border-r border-border z-40 transition-all duration-300 ease-in-out md:flex flex-col',
          isExpanded ? 'w-64' : 'w-16'
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-center border-b border-border">
          {isExpanded ? (
            <div className="flex items-center gap-2 px-4">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">BUG Club</span>
            </div>
          ) : (
            <Gamepad2 className="h-6 w-6 text-primary" />
          )}
        </div>

        {/* Navigation Items - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 sidebar-scroll">
          {processedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
                           (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  !isExpanded && 'justify-center'
                )}
                title={!isExpanded ? item.name : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary-foreground')} />
                {isExpanded && (
                  <span className="font-medium whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Expand/Collapse Indicator */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground transition-transform duration-300',
            isExpanded && 'rotate-180'
          )}>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under sidebar - Only on tablet and desktop */}
      <div className={cn('transition-all duration-300', 'md:ml-16', isExpanded && 'md:ml-64')} />
    </>
  );
}
