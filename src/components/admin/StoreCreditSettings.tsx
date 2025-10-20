'use client';

import { useState, useEffect } from 'react';
import { StoreCreditSettings as StoreCreditSettingsType } from '@/types/types';
import { getStoreCreditSettings, updateStoreCreditSettings } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatCentsToDollars, dollarsToCents } from '@/lib/storeCredit';

export default function StoreCreditSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreCreditSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getStoreCreditSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await updateStoreCreditSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 bg-card border rounded-lg">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No settings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Store Credit Settings</h2>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discount Caps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Discount Caps
            </CardTitle>
            <CardDescription>Maximum discount limits for store credit usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="perItemCap">Per-Item Discount Cap (%)</Label>
              <Input
                id="perItemCap"
                type="number"
                min="0"
                max="100"
                value={settings.perItemDiscountCap}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  perItemDiscountCap: parseInt(e.target.value) || 0 
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Currently: {settings.perItemDiscountCap}% max per item
              </p>
            </div>

            <div>
              <Label htmlFor="perOrderCap">Per-Order Discount Cap ($)</Label>
              <Input
                id="perOrderCap"
                type="number"
                min="0"
                step="0.01"
                value={(settings.perOrderDiscountCap / 100).toFixed(2)}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  perOrderDiscountCap: Math.round(parseFloat(e.target.value) * 100) || 0 
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Currently: {formatCentsToDollars(settings.perOrderDiscountCap)} max per order
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Earning Caps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Earning Caps
            </CardTitle>
            <CardDescription>Maximum credit earning limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="monthlyCap">Monthly Earning Cap ($)</Label>
              <Input
                id="monthlyCap"
                type="number"
                min="0"
                step="0.01"
                value={(settings.monthlyEarningCap / 100).toFixed(2)}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  monthlyEarningCap: Math.round(parseFloat(e.target.value) * 100) || 0 
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Currently: {formatCentsToDollars(settings.monthlyEarningCap)} max per month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Earning Values */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Credit Earning Values
            </CardTitle>
            <CardDescription>How much credit users earn for different activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventAttendance">Event Attendance ($)</Label>
                <Input
                  id="eventAttendance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={(settings.earningValues.eventAttendance / 100).toFixed(2)}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    earningValues: {
                      ...settings.earningValues,
                      eventAttendance: Math.round(parseFloat(e.target.value) * 100) || 0
                    }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Currently: {formatCentsToDollars(settings.earningValues.eventAttendance)}
                </p>
              </div>

              <div>
                <Label htmlFor="volunteerWork">Volunteer Work ($)</Label>
                <Input
                  id="volunteerWork"
                  type="number"
                  min="0"
                  step="0.01"
                  value={(settings.earningValues.volunteerWork / 100).toFixed(2)}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    earningValues: {
                      ...settings.earningValues,
                      volunteerWork: Math.round(parseFloat(e.target.value) * 100) || 0
                    }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Currently: {formatCentsToDollars(settings.earningValues.volunteerWork)}
                </p>
              </div>

              <div>
                <Label htmlFor="eventHosting">Event Hosting ($)</Label>
                <Input
                  id="eventHosting"
                  type="number"
                  min="0"
                  step="0.01"
                  value={(settings.earningValues.eventHosting / 100).toFixed(2)}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    earningValues: {
                      ...settings.earningValues,
                      eventHosting: Math.round(parseFloat(e.target.value) * 100) || 0
                    }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Currently: {formatCentsToDollars(settings.earningValues.eventHosting)}
                </p>
              </div>

              <div>
                <Label htmlFor="contributionMin">Contribution Min ($)</Label>
                <Input
                  id="contributionMin"
                  type="number"
                  min="0"
                  step="0.01"
                  value={(settings.earningValues.contributionMin / 100).toFixed(2)}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    earningValues: {
                      ...settings.earningValues,
                      contributionMin: Math.round(parseFloat(e.target.value) * 100) || 0
                    }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Currently: {formatCentsToDollars(settings.earningValues.contributionMin)}
                </p>
              </div>

              <div>
                <Label htmlFor="contributionMax">Contribution Max ($)</Label>
                <Input
                  id="contributionMax"
                  type="number"
                  min="0"
                  step="0.01"
                  value={(settings.earningValues.contributionMax / 100).toFixed(2)}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    earningValues: {
                      ...settings.earningValues,
                      contributionMax: Math.round(parseFloat(e.target.value) * 100) || 0
                    }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Currently: {formatCentsToDollars(settings.earningValues.contributionMax)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> All amounts are in USD. Changes take effect immediately for new transactions.
            Existing pending transactions will use the settings that were active when they were created.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

