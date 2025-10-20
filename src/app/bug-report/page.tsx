'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bug, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
type BugCategory = 'ui' | 'functionality' | 'performance' | 'security' | 'other';

export default function BugReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('medium');
  const [category, setCategory] = useState<BugCategory>('functionality');
  const [browserInfo, setBrowserInfo] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');

  // Auto-detect browser and device info
  useState(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      setBrowserInfo(userAgent);

      // Detect device type
      const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
      const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
      const deviceType = isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop';
      setDeviceInfo(`${deviceType} - ${navigator.platform}`);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Create bug report payload
      const bugReport = {
        title,
        description,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        severity,
        category,
        browserInfo,
        deviceInfo,
        reportedBy: user?.email || 'Anonymous',
        reportedByUid: user?.uid || 'anonymous',
        reportedByName: user?.displayName || 'Anonymous User',
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      // Submit to API endpoint
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bugReport),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit bug report');
      }

      const result = await response.json();

      setSubmitted(true);
      toast.success('Bug report submitted successfully!');

      // Show GitHub issue link if available
      if (result.issueUrl) {
        toast.success(
          <div>
            <p>GitHub issue created!</p>
            <a href={result.issueUrl} target="_blank" rel="noopener noreferrer" className="underline">
              View Issue #{result.issueNumber}
            </a>
          </div>,
          { duration: 10000 }
        );
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setStepsToReproduce('');
        setExpectedBehavior('');
        setActualBehavior('');
        setSeverity('medium');
        setCategory('functionality');
        setSubmitted(false);
      }, 2000);

    } catch (err) {
      console.error('Error submitting bug report:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit bug report');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your bug report has been submitted successfully. We&apos;ll investigate and fix it as soon as possible.
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bug className="h-8 w-8" />
              Report a Bug
            </h1>
            <p className="text-muted-foreground mt-1">
              Help us improve by reporting issues you encounter
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle>Bug Title *</CardTitle>
              <CardDescription>A brief, descriptive title for the bug</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Upload button stuck on 'Uploading...'"
                required
                maxLength={200}
              />
            </CardContent>
          </Card>

          {/* Category and Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category *</CardTitle>
                <CardDescription>Type of issue</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={category} onValueChange={(value) => setCategory(value as BugCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ui">UI/Design</SelectItem>
                    <SelectItem value="functionality">Functionality</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Severity *</CardTitle>
                <CardDescription>How critical is this bug?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={severity} onValueChange={(value) => setSeverity(value as BugSeverity)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                    <SelectItem value="medium">Medium - Affects functionality</SelectItem>
                    <SelectItem value="high">High - Major feature broken</SelectItem>
                    <SelectItem value="critical">Critical - App unusable</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description *</CardTitle>
              <CardDescription>Detailed description of the bug</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what's happening..."
                required
                rows={4}
                maxLength={2000}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {description.length}/2000 characters
              </p>
            </CardContent>
          </Card>

          {/* Steps to Reproduce */}
          <Card>
            <CardHeader>
              <CardTitle>Steps to Reproduce</CardTitle>
              <CardDescription>How can we reproduce this bug?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                placeholder="1. Go to profile edit page&#10;2. Click upload button&#10;3. Select an image&#10;4. Button stays on 'Uploading...'"
                rows={4}
                maxLength={1000}
              />
            </CardContent>
          </Card>

          {/* Expected vs Actual Behavior */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expected Behavior</CardTitle>
                <CardDescription>What should happen?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={expectedBehavior}
                  onChange={(e) => setExpectedBehavior(e.target.value)}
                  placeholder="Button should show 'Upload Image' after upload completes"
                  rows={3}
                  maxLength={500}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actual Behavior</CardTitle>
                <CardDescription>What actually happens?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={actualBehavior}
                  onChange={(e) => setActualBehavior(e.target.value)}
                  placeholder="Button stays stuck on 'Uploading...'"
                  rows={3}
                  maxLength={500}
                />
              </CardContent>
            </Card>
          </div>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Auto-detected (you can edit if needed)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Device</Label>
                <Input
                  value={deviceInfo}
                  onChange={(e) => setDeviceInfo(e.target.value)}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Browser</Label>
                <Input
                  value={browserInfo}
                  onChange={(e) => setBrowserInfo(e.target.value)}
                  readOnly
                  className="bg-muted text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Bug className="h-4 w-4 mr-2" />
                  Submit Bug Report
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
