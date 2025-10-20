'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getStoreCreditSettings, updateStoreCreditSettings } from '@/lib/database';
import { StoreCreditSettings } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';

export default function StoreCreditSettingsManagement() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreCreditSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<StoreCreditSettings>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getStoreCreditSettings();
      setSettings(data);
      setFormData(data);
    } catch (error) {
      console.error('Error loading store credit settings:', error);
      toast.error('Failed to load store credit settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StoreCreditSettings, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateStoreCreditSettings(formData as StoreCreditSettings, user?.uid || 'unknown');
      setSettings(formData as StoreCreditSettings);
      toast.success('Store credit settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save store credit settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(settings || {});
    toast.info('Changes discarded');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading store credit settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-8 w-8 text-green-600" />
            Store Credit Settings
          </h2>
          <p className="text-muted-foreground mt-2">
            Configure store credit earning caps, discount limits, and conversion rates
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
        <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          These settings control how store credit is earned, spent, and managed across the platform.
        </AlertDescription>
      </Alert>

      {/* Settings Tabs */}
      <Tabs defaultValue="earning" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earning">Earning Settings</TabsTrigger>
          <TabsTrigger value="discount">Discount Settings</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Rate</TabsTrigger>
        </TabsList>

        {/* Earning Settings Tab */}
        <TabsContent value="earning" className="space-y-6">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
              <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Earning Caps & Values
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Set limits and values for earning store credit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Monthly Earning Cap */}
              <div className="space-y-2">
                <Label htmlFor="monthlyEarningCap" className="text-foreground font-medium">
                  Monthly Earning Cap (in cents)
                </Label>
                <Input
                  id="monthlyEarningCap"
                  type="number"
                  value={formData.monthlyEarningCap || 0}
                  onChange={(e) => handleInputChange('monthlyEarningCap', e.target.value)}
                  placeholder="e.g., 50000 for $500"
                  className="border-green-200 dark:border-green-800"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum store credit a user can earn per month: ${((formData.monthlyEarningCap || 0) / 100).toFixed(2)}
                </p>
              </div>

              {/* Event Attendance Credit */}
              <div className="space-y-2">
                <Label htmlFor="eventAttendanceCredit" className="text-foreground font-medium">
                  Event Attendance Credit (in cents)
                </Label>
                <Input
                  id="eventAttendanceCredit"
                  type="number"
                  value={(formData as any).eventAttendanceCredit || 0}
                  onChange={(e) => handleInputChange('eventAttendanceCredit' as any, e.target.value)}
                  placeholder="e.g., 500 for $5"
                  className="border-green-200 dark:border-green-800"
                />
                <p className="text-sm text-muted-foreground">
                  Credit awarded per event attendance: ${(((formData as any).eventAttendanceCredit || 0) / 100).toFixed(2)}
                </p>
              </div>

              {/* Volunteer Work Credit */}
              <div className="space-y-2">
                <Label htmlFor="volunteerWorkCredit" className="text-foreground font-medium">
                  Volunteer Work Credit (in cents)
                </Label>
                <Input
                  id="volunteerWorkCredit"
                  type="number"
                  value={(formData as any).volunteerWorkCredit || 0}
                  onChange={(e) => handleInputChange('volunteerWorkCredit' as any, e.target.value)}
                  placeholder="e.g., 1000 for $10"
                  className="border-green-200 dark:border-green-800"
                />
                <p className="text-sm text-muted-foreground">
                  Credit awarded per volunteer activity: ${(((formData as any).volunteerWorkCredit || 0) / 100).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discount Settings Tab */}
        <TabsContent value="discount" className="space-y-6">
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
              <CardTitle className="text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Discount Limits
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Set maximum discount amounts for purchases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Per-Item Discount Cap */}
              <div className="space-y-2">
                <Label htmlFor="perItemDiscountCap" className="text-foreground font-medium">
                  Per-Item Discount Cap (%)
                </Label>
                <Input
                  id="perItemDiscountCap"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.perItemDiscountCap || 0}
                  onChange={(e) => handleInputChange('perItemDiscountCap', e.target.value)}
                  placeholder="e.g., 50 for 50%"
                  className="border-yellow-200 dark:border-yellow-800"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum discount percentage per item: {formData.perItemDiscountCap || 0}%
                </p>
              </div>

              {/* Per-Order Discount Cap */}
              <div className="space-y-2">
                <Label htmlFor="perOrderDiscountCap" className="text-foreground font-medium">
                  Per-Order Discount Cap (in cents)
                </Label>
                <Input
                  id="perOrderDiscountCap"
                  type="number"
                  value={formData.perOrderDiscountCap || 0}
                  onChange={(e) => handleInputChange('perOrderDiscountCap', e.target.value)}
                  placeholder="e.g., 3000 for $30"
                  className="border-yellow-200 dark:border-yellow-800"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum discount per order: ${((formData.perOrderDiscountCap || 0) / 100).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Rate Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
              <CardTitle className="text-green-900 dark:text-green-100">
                Points to Store Credit Conversion
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Set the conversion rate for legacy points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="pointsToCreditsRatio" className="text-foreground font-medium">
                  Points to Credits Ratio
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="pointsToCreditsRatio"
                      type="number"
                      value={(formData as any).pointsToCreditsRatio || 200}
                      onChange={(e) => handleInputChange('pointsToCreditsRatio' as any, e.target.value)}
                      placeholder="e.g., 200"
                      className="border-green-200 dark:border-green-800"
                    />
                  </div>
                  <span className="text-foreground font-medium">points = $1.00</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {(formData as any).pointsToCreditsRatio || 200} points = $1.00 store credit
                </p>
              </div>

              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  This conversion rate is used when migrating legacy points to store credit.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saving}
          className="border-gray-300 dark:border-gray-700"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white font-medium"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
