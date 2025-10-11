'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Zap, Users, TrendingUp } from 'lucide-react';
import PointsMultiplierManagement from '@/components/admin/PointsMultiplierManagement';
import WelcomePointsPromotions from '@/components/admin/WelcomePointsPromotions';
import SalesPromotions from '@/components/admin/SalesPromotions';
import PointGiveaways from '@/components/admin/PointGiveaways';

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState('multipliers');

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Gift className="h-10 w-10 text-primary" />
              Promotions & Campaigns
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage points multipliers, welcome bonuses, sales, and point giveaways
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="multipliers" className="gap-2">
                <Zap className="h-4 w-4" />
                Points Multipliers
              </TabsTrigger>
              <TabsTrigger value="welcome" className="gap-2">
                <Users className="h-4 w-4" />
                Welcome Bonuses
              </TabsTrigger>
              <TabsTrigger value="sales" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Sales & Discounts
              </TabsTrigger>
              <TabsTrigger value="giveaways" className="gap-2">
                <Gift className="h-4 w-4" />
                Point Giveaways
              </TabsTrigger>
            </TabsList>

            <TabsContent value="multipliers" className="space-y-4">
              <PointsMultiplierManagement />
            </TabsContent>

            <TabsContent value="welcome" className="space-y-4">
              <WelcomePointsPromotions />
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              <SalesPromotions />
            </TabsContent>

            <TabsContent value="giveaways" className="space-y-4">
              <PointGiveaways />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}

