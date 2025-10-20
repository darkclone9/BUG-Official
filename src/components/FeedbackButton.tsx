'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Bug, Lightbulb, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FeedbackButtonProps {
  variant?: 'default' | 'floating' | 'inline';
  showBubble?: boolean;
}

export default function FeedbackButton({ variant = 'default', showBubble = true }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'bug',
    title: '',
    description: '',
    email: '',
  });
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let githubIssueNumber = null;
      let githubIssueUrl = null;

      // Try to create GitHub issue via API
      try {
        const response = await fetch('/api/create-github-issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: formData.type,
            title: formData.title,
            description: formData.description,
            email: formData.email || user?.email || 'anonymous',
            userId: user?.uid || null,
            userName: user?.displayName || 'Anonymous',
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          githubIssueNumber = result.issueNumber;
          githubIssueUrl = result.issueUrl;
        } else {
          const errorData = await response.json();
          console.warn('GitHub issue creation failed (will save to Firebase only):', errorData);
        }
      } catch (githubError) {
        console.warn('GitHub issue creation failed (will save to Firebase only):', githubError);
      }

      // Always save to Firebase for backup/tracking
      await addDoc(collection(db, 'feedback'), {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        email: formData.email || user?.email || 'anonymous',
        userId: user?.uid || null,
        userName: user?.displayName || 'Anonymous',
        status: 'new',
        createdAt: serverTimestamp(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        githubIssueNumber: githubIssueNumber,
        githubIssueUrl: githubIssueUrl,
      });

      // Reset form
      setFormData({
        type: 'bug',
        title: '',
        description: '',
        email: '',
      });

      setIsOpen(false);

      if (githubIssueNumber) {
        alert(`Thank you for your feedback! A GitHub issue #${githubIssueNumber} has been created.`);
      } else {
        alert('Thank you for your feedback! We\'ll review it soon.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (formData.type) {
      case 'bug':
        return <Bug className="h-4 w-4" />;
      case 'feature':
        return <Lightbulb className="h-4 w-4" />;
      case 'other':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (variant === 'floating') {
    return (
      <>
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {showBubble && (
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-bounce">
              Found a bug? Please report it here!
            </div>
          )}
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all"
          >
            <Bug className="h-6 w-6" />
          </Button>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getIcon()}
                Submit Feedback
              </DialogTitle>
              <DialogDescription>
                Help us improve by reporting bugs, suggesting features, or sharing your thoughts.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Feedback Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">
                      <div className="flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        Bug Report
                      </div>
                    </SelectItem>
                    <SelectItem value="feature">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Feature Request
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Other Feedback
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief summary of your feedback"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide as much detail as possible..."
                  rows={5}
                  required
                />
              </div>

              {!user && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll use this to follow up if needed
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Inline variant for navigation/sidebar
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        className="w-full justify-start gap-2"
      >
        <Bug className="h-4 w-4" />
        Report Bug
        {showBubble && (
          <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
            New
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon()}
              Submit Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve by reporting bugs, suggesting features, or sharing your thoughts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Feedback Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4" />
                      Bug Report
                    </div>
                  </SelectItem>
                  <SelectItem value="feature">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Feature Request
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Other Feedback
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary of your feedback"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide as much detail as possible..."
                rows={5}
                required
              />
            </div>

            {!user && (
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll use this to follow up if needed
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
