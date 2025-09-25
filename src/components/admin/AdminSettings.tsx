'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Users,
  Trophy
} from 'lucide-react';

interface AdminSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  defaultPoints: {
    tournamentWin: number;
    tournamentSecond: number;
    tournamentThird: number;
    participation: number;
  };
  tournamentSettings: {
    maxParticipants: number;
    registrationDeadlineDays: number;
    autoStartTournaments: boolean;
  };
  userSettings: {
    allowProfileUpdates: boolean;
    requireEmailVerification: boolean;
    defaultRole: 'member' | 'guest';
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    siteName: 'Gaming Club',
    siteDescription: 'A community for competitive gaming tournaments',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    defaultPoints: {
      tournamentWin: 100,
      tournamentSecond: 50,
      tournamentThird: 25,
      participation: 10,
    },
    tournamentSettings: {
      maxParticipants: 16,
      registrationDeadlineDays: 7,
      autoStartTournaments: false,
    },
    userSettings: {
      allowProfileUpdates: true,
      requireEmailVerification: false,
      defaultRole: 'member',
    },
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here you would typically save to your database
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default settings
    setSettings({
      siteName: 'Gaming Club',
      siteDescription: 'A community for competitive gaming tournaments',
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      defaultPoints: {
        tournamentWin: 100,
        tournamentSecond: 50,
        tournamentThird: 25,
        participation: 10,
      },
      tournamentSettings: {
        maxParticipants: 16,
        registrationDeadlineDays: 7,
        autoStartTournaments: false,
      },
      userSettings: {
        allowProfileUpdates: true,
        requireEmailVerification: false,
        defaultRole: 'member',
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-400" />
            General Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            Basic site configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-gray-400">Enable maintenance mode to restrict site access</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="registrationEnabled">Registration Enabled</Label>
                <p className="text-sm text-gray-400">Allow new users to register</p>
              </div>
              <Switch
                id="registrationEnabled"
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, registrationEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-400">Send email notifications to users</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points Settings */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
            Points Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            Default points awarded for tournament participation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tournamentWin">1st Place</Label>
              <Input
                id="tournamentWin"
                type="number"
                min="0"
                value={settings.defaultPoints.tournamentWin}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  defaultPoints: { ...prev.defaultPoints, tournamentWin: parseInt(e.target.value) || 0 }
                }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tournamentSecond">2nd Place</Label>
              <Input
                id="tournamentSecond"
                type="number"
                min="0"
                value={settings.defaultPoints.tournamentSecond}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  defaultPoints: { ...prev.defaultPoints, tournamentSecond: parseInt(e.target.value) || 0 }
                }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tournamentThird">3rd Place</Label>
              <Input
                id="tournamentThird"
                type="number"
                min="0"
                value={settings.defaultPoints.tournamentThird}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  defaultPoints: { ...prev.defaultPoints, tournamentThird: parseInt(e.target.value) || 0 }
                }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participation">Participation</Label>
              <Input
                id="participation"
                type="number"
                min="0"
                value={settings.defaultPoints.participation}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  defaultPoints: { ...prev.defaultPoints, participation: parseInt(e.target.value) || 0 }
                }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Settings */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-purple-400" />
            Tournament Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            Default tournament configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Default Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="2"
                max="64"
                value={settings.tournamentSettings.maxParticipants}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  tournamentSettings: { ...prev.tournamentSettings, maxParticipants: parseInt(e.target.value) || 16 }
                }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationDeadlineDays">Registration Deadline (Days)</Label>
              <Input
                id="registrationDeadlineDays"
                type="number"
                min="1"
                max="30"
                value={settings.tournamentSettings.registrationDeadlineDays}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  tournamentSettings: { ...prev.tournamentSettings, registrationDeadlineDays: parseInt(e.target.value) || 7 }
                }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoStartTournaments">Auto-Start Tournaments</Label>
              <p className="text-sm text-gray-400">Automatically start tournaments when registration deadline passes</p>
            </div>
            <Switch
              id="autoStartTournaments"
              checked={settings.tournamentSettings.autoStartTournaments}
              onCheckedChange={(checked) => setSettings(prev => ({ 
                ...prev, 
                tournamentSettings: { ...prev.tournamentSettings, autoStartTournaments: checked }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* User Settings */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-400" />
            User Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            User account and profile settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowProfileUpdates">Allow Profile Updates</Label>
                <p className="text-sm text-gray-400">Allow users to update their profiles</p>
              </div>
              <Switch
                id="allowProfileUpdates"
                checked={settings.userSettings.allowProfileUpdates}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  userSettings: { ...prev.userSettings, allowProfileUpdates: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-sm text-gray-400">Require users to verify their email addresses</p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.userSettings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  userSettings: { ...prev.userSettings, requireEmailVerification: checked }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultRole">Default User Role</Label>
              <Select 
                value={settings.userSettings.defaultRole} 
                onValueChange={(value: 'member' | 'guest') => setSettings(prev => ({ 
                  ...prev, 
                  userSettings: { ...prev.userSettings, defaultRole: value }
                }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}