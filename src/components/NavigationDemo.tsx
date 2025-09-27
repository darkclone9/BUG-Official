'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gamepad2, Menu, X, Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import AnnouncementBarDemo from './AnnouncementBarDemo';

export default function NavigationDemo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <AnnouncementBarDemo />
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
              <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                <Search className="h-4 w-4" />
              </Link>
            </div>

            {/* Right side - Theme toggle and Auth buttons */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>

              {/* Auth Buttons for Demo */}
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-4 py-4 space-y-3">
              <Link 
                href="/" 
                className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/tournaments" 
                className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tournaments
              </Link>
              <Link 
                href="/leaderboard" 
                className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Leaderboard
              </Link>
              <Link 
                href="/players" 
                className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Players
              </Link>
              <Link 
                href="/search" 
                className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search
              </Link>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-border space-y-2">
                <Link href="/login" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
