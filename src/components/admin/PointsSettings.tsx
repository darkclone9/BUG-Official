'use client';

import { useState, useEffect } from 'react';
import { PointsSettings as PointsSettingsType } from '@/types/types';
import { getPointsSettings, updatePointsSettings } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PointsSettings() {
  const [settings, setSettings] = useState<PointsSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getPointsSettings();
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
      await updatePointsSettings(settings);
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
        <h2 className="text-2xl font-bold text-foreground">Points Settings</h2>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates</CardTitle>
            <CardDescription>How points convert to discounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pointsPerDollar">Points per Dollar</Label>
              <Input
                id="pointsPerDollar"
                type="number"
                value={settings.pointsPerDollar}
                onChange={(e) => setSettings({ ...settings, pointsPerDollar: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Currently: {settings.pointsPerDollar} points = $1.00
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Discount Caps */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Limits</CardTitle>
            <CardDescription>Maximum discounts allowed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxDiscountPerItem">Max Discount Per Item (%)</Label>
              <Input
                id="maxDiscountPerItem"
                type="number"
                value={settings.maxDiscountPerItem}
                onChange={(e) => setSettings({ ...settings, maxDiscountPerItem: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum {settings.maxDiscountPerItem}% off any single item
              </p>
            </div>

            <div>
              <Label htmlFor="maxDiscountPerOrder">Max Discount Per Order (cents)</Label>
              <Input
                id="maxDiscountPerOrder"
                type="number"
                value={settings.maxDiscountPerOrder}
                onChange={(e) => setSettings({ ...settings, maxDiscountPerOrder: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum ${(settings.maxDiscountPerOrder / 100).toFixed(2)} off per order
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Earning Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Earning Limits</CardTitle>
            <CardDescription>Caps on points earning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="monthlyEarningCap">Monthly Earning Cap</Label>
              <Input
                id="monthlyEarningCap"
                type="number"
                value={settings.monthlyEarningCap}
                onChange={(e) => setSettings({ ...settings, monthlyEarningCap: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Users can earn up to {settings.monthlyEarningCap.toLocaleString()} points per month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expiration Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Expiration</CardTitle>
            <CardDescription>Points expiration rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="expirationMonths">Expiration Period (months)</Label>
              <Input
                id="expirationMonths"
                type="number"
                value={settings.expirationMonths}
                onChange={(e) => setSettings({ ...settings, expirationMonths: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Points expire after {settings.expirationMonths} months
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Approval Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Workflow</CardTitle>
            <CardDescription>Points approval requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="autoApproveThreshold">Auto-Approve Threshold</Label>
              <Input
                id="autoApproveThreshold"
                type="number"
                value={settings.autoApproveThreshold}
                onChange={(e) => setSettings({ ...settings, autoApproveThreshold: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Points awards under {settings.autoApproveThreshold} are auto-approved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Multiplier Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Multipliers</CardTitle>
            <CardDescription>Default multiplier values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultMultiplier">Default Multiplier</Label>
              <Input
                id="defaultMultiplier"
                type="number"
                step="0.1"
                value={settings.defaultMultiplier}
                onChange={(e) => setSettings({ ...settings, defaultMultiplier: parseFloat(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Base multiplier: {settings.defaultMultiplier}x
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Current Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• {settings.pointsPerDollar} points = $1.00 discount</p>
          <p>• Maximum {settings.maxDiscountPerItem}% off per item</p>
          <p>• Maximum ${(settings.maxDiscountPerOrder / 100).toFixed(2)} off per order</p>
          <p>• Users can earn up to {settings.monthlyEarningCap.toLocaleString()} points/month</p>
          <p>• Points expire after {settings.expirationMonths} months</p>
          <p>• Auto-approve awards under {settings.autoApproveThreshold} points</p>
          <p>• Default multiplier: {settings.defaultMultiplier}x</p>
        </CardContent>
      </Card>
    </div>
  );
}

