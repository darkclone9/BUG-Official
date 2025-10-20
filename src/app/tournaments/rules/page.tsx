'use client';

import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle, Trophy } from 'lucide-react';

export default function TournamentRulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <div className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-green-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="h-12 w-12 mr-3" />
              <h1 className="text-5xl sm:text-6xl font-bold">Tournament Rules</h1>
            </div>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Understand the guidelines and rules for participating in BUG tournaments
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/tournaments">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </Link>

        {/* General Rules */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              General Rules
            </CardTitle>
            <CardDescription>Basic guidelines for all tournament participants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Eligibility</h4>
                  <p className="text-sm text-muted-foreground">All BUG club members are eligible to participate in tournaments. You must have an active account to register.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Registration</h4>
                  <p className="text-sm text-muted-foreground">Register before the registration deadline. Late registrations are not accepted. Check the tournament details for specific deadlines.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Participation</h4>
                  <p className="text-sm text-muted-foreground">Once registered, you are committed to participating. Cancellations must be made before the tournament starts.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conduct Rules */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Code of Conduct
            </CardTitle>
            <CardDescription>Expected behavior during tournaments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Respect</h4>
                  <p className="text-sm text-muted-foreground">Treat all participants with respect. No harassment, discrimination, or offensive language is tolerated.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Fair Play</h4>
                  <p className="text-sm text-muted-foreground">Play fairly and honestly. Cheating, exploiting glitches, or using unauthorized tools will result in disqualification.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Punctuality</h4>
                  <p className="text-sm text-muted-foreground">Arrive on time for your matches. Excessive delays may result in forfeiture.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Rules */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scoring & Advancement</CardTitle>
            <CardDescription>How tournaments are scored and winners are determined</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Match Results</h4>
                  <p className="text-sm text-muted-foreground">Winners advance to the next round. Losers are eliminated (single elimination) or continue in a losers bracket (double elimination).</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Tiebreakers</h4>
                  <p className="text-sm text-muted-foreground">In case of ties, a rematch will be played. If a rematch is not possible, the tournament organizer will determine the winner.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Prizes</h4>
                  <p className="text-sm text-muted-foreground">Prizes are awarded to top finishers as specified in the tournament details. Prize distribution is final.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disputes */}
        <Card>
          <CardHeader>
            <CardTitle>Disputes & Appeals</CardTitle>
            <CardDescription>How to handle disagreements or rule violations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Reporting Issues</h4>
                  <p className="text-sm text-muted-foreground">Report any issues or rule violations to the tournament organizer immediately. Provide evidence if possible.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Appeals Process</h4>
                  <p className="text-sm text-muted-foreground">Appeals must be submitted within 24 hours of the incident. The tournament organizer will review and make a final decision.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Penalties</h4>
                  <p className="text-sm text-muted-foreground">Violations may result in warnings, disqualification, or bans from future tournaments.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/tournaments">
            <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-green-500 text-white hover:from-yellow-500 hover:to-green-600">
              Back to Tournaments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

