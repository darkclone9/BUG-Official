'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  presidentOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false, presidentOnly = false }: ProtectedRouteProps) {
  const { user, loading, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (presidentOnly && !hasAnyRole(['president', 'co_president'])) {
        router.push('/dashboard');
        return;
      }

      if (adminOnly && user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, adminOnly, presidentOnly, hasAnyRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-96 bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Gamepad2 className="h-12 w-12 text-purple-400 animate-pulse mb-4" />
            <p className="text-lg font-medium">Loading...</p>
            <p className="text-sm text-gray-400">Please wait while we load your data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (presidentOnly && !hasAnyRole(['president', 'co_president'])) {
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
