'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUser, convertPointsToStoreCredit } from '@/lib/database';
import { formatCentsToDollars } from '@/lib/storeCredit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, DollarSign, Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function ConvertPointsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pointsBalance, setPointsBalance] = useState(0);
  const [storeCreditBalance, setStoreCreditBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [error, setError] = useState('');
  const [alreadyConverted, setAlreadyConverted] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      router.push('/login');
    }
  }, [user, router]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userData = await getUser(user.uid);

      if (userData) {
        // Use 'points' field (same as Leaderboard) for legacy points conversion
        setPointsBalance(userData.points || 0);
        setStoreCreditBalance(userData.storeCreditBalance || 0);
        setAlreadyConverted(userData.pointsConverted === true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load your account information');
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!user) return;

    try {
      setConverting(true);
      setError('');

      const result = await convertPointsToStoreCredit(user.uid);

      if (result.success) {
        setConverted(true);
        setPointsBalance(0);
        setStoreCreditBalance(prev => prev + result.creditEarned);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error converting points:', error);
      setError('Failed to convert points. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const estimatedCreditCents = Math.floor((pointsBalance / 200) * 100);
  const estimatedCreditDisplay = formatCentsToDollars(estimatedCreditCents);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-500 via-green-600 to-yellow-500 text-white overflow-hidden py-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-bold mb-2">
            Convert Points to Store Credit
          </h1>
          <p className="text-lg text-white/90">
            Upgrade your legacy points to the new store credit system
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Success Message */}
        {converted && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Success!</strong> Your points have been converted to store credit. You can now use your credit in the shop!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Already Converted Message */}
        {alreadyConverted && !converted && (
          <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              You have already converted your points to store credit. You can only convert once.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Current Points - Yellow */}
          <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Legacy Points
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">Your current points balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                {pointsBalance.toLocaleString()}
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                {pointsBalance === 0 ? 'No points to convert' : 'Available for conversion'}
              </p>
            </CardContent>
          </Card>

          {/* Store Credit - Green */}
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                Store Credit
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">Your current store credit balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {formatCentsToDollars(storeCreditBalance)}
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Direct dollar-for-dollar discount
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Info */}
        <Card className="mb-8 border-green-200 dark:border-green-800">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
            <CardTitle className="text-green-900 dark:text-green-100">Conversion Details</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">How your points will be converted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Conversion Rate */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Conversion Rate</h3>
              <div className="flex items-center justify-center gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-semibold text-yellow-900 dark:text-yellow-100">200 points</span>
                </div>
                <ArrowRight className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-900 dark:text-green-100">$1.00 credit</span>
                </div>
              </div>
            </div>

            {/* Estimated Conversion */}
            {pointsBalance > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">Your Conversion</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300">You will receive</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {estimatedCreditDisplay}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">From</p>
                    <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
                      {pointsBalance.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Important Notes:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ This conversion is <strong>one-time only</strong></li>
                <li>✓ Your points will be set to zero after conversion</li>
                <li>✓ Store credit <strong>never expires</strong></li>
                <li>✓ You can use credit immediately in the shop</li>
                <li>✓ Maximum 50% off per item, $30 off per order</li>
              </ul>
            </div>

            {/* Convert Button */}
            <div className="pt-4">
              <Button
                onClick={handleConvert}
                disabled={converting || converted || alreadyConverted || pointsBalance === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                size="lg"
              >
                {converting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : converted || alreadyConverted ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Already Converted
                  </>
                ) : pointsBalance === 0 ? (
                  'No Points to Convert'
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Convert {pointsBalance.toLocaleString()} Points to {estimatedCreditDisplay}
                  </>
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            {(converted || alreadyConverted) && (
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium" asChild>
                  <Link href="/shop">Go to Shop</Link>
                </Button>
                <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium" asChild>
                  <Link href="/profile">View Profile</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10">
            <CardTitle className="text-yellow-900 dark:text-yellow-100">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why should I convert?</h4>
              <p className="text-sm text-muted-foreground">
                Store credit is simpler (direct dollar value), never expires, and is easier to understand than the old points system.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Can I convert back to points?</h4>
              <p className="text-sm text-muted-foreground">
                No, conversion is one-way only. Once converted to store credit, you cannot convert back to points.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">What if I don't convert?</h4>
              <p className="text-sm text-muted-foreground">
                Your points will remain in your account, but the points system is being phased out. We recommend converting to take advantage of the new store credit benefits.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Can I convert multiple times?</h4>
              <p className="text-sm text-muted-foreground">
                No, you can only convert once. Make sure you're ready before clicking the convert button.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
