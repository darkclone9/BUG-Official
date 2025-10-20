'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Bell, Edit, Gamepad2, LogOut, Menu, Search, Settings, ShoppingBag, Trophy, User, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import BroadcastBar from './BroadcastBar';
import NotificationDropdown from './NotificationDropdown';
import MessageNotificationDropdown from './MessageNotificationDropdown';
import { ThemeToggle } from './ThemeToggle';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Only show navigation on the landing page (/)
  if (pathname !== '/') {
    return null;
  }

  return (
    <>
      <BroadcastBar />
      <AnnouncementBar />
      <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">Gaming Club</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Home
            </Link>
            <Link href="/tournaments" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Tournaments
            </Link>
            <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Leaderboard
            </Link>
            <Link href="/players" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Players
            </Link>
            <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Shop
            </Link>
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              <Search className="h-4 w-4" />
            </Link>
          </div>

          {/* Right side - Theme toggle and User menu */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-9 w-9"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <>
                  {/* Message Notifications */}
                  <MessageNotificationDropdown />

                  {/* Announcements Notifications */}
                  <NotificationDropdown />

                  <Link href="/dashboard">
                    <Button variant="secondary" size="sm">
                      <Trophy className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>

                  {user.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl || user.avatar} alt={user.displayName} />
                          <AvatarFallback>
                            {user.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.points} points
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit" className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tournaments" className="flex items-center">
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Tournaments</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/leaderboard" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Leaderboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-md border-t border-border">
              <Link
                href="/"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/tournaments"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tournaments
              </Link>
              <Link
                href="/leaderboard"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Leaderboard
              </Link>
              <Link
                href="/players"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Players
              </Link>
              <Link
                href="/shop"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingBag className="inline h-4 w-4 mr-2" />
                Shop
              </Link>
              <Link
                href="/search"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="inline h-4 w-4 mr-2" />
                Search
              </Link>

              {user ? (
                <>
                  <div className="border-t border-border pt-2 mt-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Bell className="inline h-4 w-4 mr-2" />
                      Notifications
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Trophy className="inline h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="inline h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/settings"
                      className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="inline h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-destructive hover:text-destructive/80 transition-colors font-medium"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
