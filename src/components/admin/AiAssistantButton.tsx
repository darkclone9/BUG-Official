'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AiAssistantButtonProps {
  currentText: string;
  type: 'event_name' | 'event_description' | 'tournament_name' | 'tournament_description';
  onAccept: (improvedText: string) => void;
  disabled?: boolean;
}

export default function AiAssistantButton({
  currentText,
  type,
  onAccept,
  disabled = false,
}: AiAssistantButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [improvedText, setImprovedText] = useState('');
  const [error, setError] = useState('');

  const handleGetSuggestion = async () => {
    if (!currentText.trim()) {
      setError('Please enter some text first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: currentText,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get suggestion');
      }

      setImprovedText(data.improvedText);
      setShowDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    onAccept(improvedText);
    setShowDialog(false);
    setImprovedText('');
  };

  const handleReject = () => {
    setShowDialog(false);
    setImprovedText('');
  };

  const getButtonText = () => {
    if (type.includes('name')) {
      return 'Ask Antony for a Better Name';
    }
    return 'Ask Antony for Help';
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGetSuggestion}
        disabled={disabled || loading || !currentText.trim()}
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Antony is thinking...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {getButtonText()}
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Antony&apos;s Suggestion
            </DialogTitle>
            <DialogDescription>
              Antony the Ant has improved your {type.includes('name') ? 'name' : 'description'}. 
              You can accept it or keep your original text.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Your Original:</h4>
              <div className="p-3 bg-muted rounded-md text-sm">
                {currentText}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-primary">Antony&apos;s Suggestion:</h4>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-sm">
                {improvedText}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReject}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Keep Original
            </Button>
            <Button
              type="button"
              onClick={handleAccept}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Use Antony&apos;s Suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

