'use client';

import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, AlertTriangle, Scale, RefreshCw, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const lastUpdated = "January 2025";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <FileText className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            Terms of Service
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Please read these terms carefully before using our gaming platform.
          </p>
          <p className="text-sm text-white/80 mt-4">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Acceptance of Terms */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="h-5 w-5 mr-2 text-primary" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By accessing and using BUG Gaming Club (&quot;the Platform&quot;), you accept and agree to be
                bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please
                do not use our services.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. Your continued use of the
                Platform after changes are posted constitutes your acceptance of the modified Terms.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                User Accounts and Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Account Creation</h4>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>You must be at least 13 years old to create an account</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must not share your account credentials with others</li>
                  <li>One person may only maintain one account</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Account Responsibilities</h4>
                <p>You are responsible for all activities that occur under your account. You agree to:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Ensure your account information remains accurate and up-to-date</li>
                  <li>Not use another user&apos;s account without permission</li>
                  <li>Not create accounts using automated means or false pretenses</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Code of Conduct */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Code of Conduct
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To maintain a positive and inclusive community, all users must adhere to the following
                code of conduct:
              </p>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Prohibited Behavior</h4>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Harassment, bullying, or threatening other users</li>
                  <li>Hate speech, discrimination, or offensive content</li>
                  <li>Cheating, exploiting, or manipulating tournament results</li>
                  <li>Impersonating other users or staff members</li>
                  <li>Spamming or posting irrelevant content</li>
                  <li>Sharing inappropriate or illegal content</li>
                  <li>Attempting to hack or compromise the platform</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Tournament Conduct</h4>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Respect all participants and organizers</li>
                  <li>Follow tournament rules and schedules</li>
                  <li>Report technical issues promptly</li>
                  <li>Accept results gracefully</li>
                  <li>Do not engage in unsportsmanlike behavior</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Consequences</h4>
                <p>
                  Violations of the code of conduct may result in warnings, temporary suspension,
                  or permanent ban from the platform, depending on the severity of the violation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tournament Rules */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Tournament and Event Participation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Registration</h4>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>You must register before the registration deadline</li>
                  <li>Registration may be limited by participant capacity</li>
                  <li>You may be required to check in before tournaments begin</li>
                  <li>Failure to check in may result in disqualification</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Fair Play</h4>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All participants must compete fairly and honestly</li>
                  <li>Use of cheats, hacks, or exploits is strictly prohibited</li>
                  <li>Match fixing or collusion is not allowed</li>
                  <li>Disputes should be reported to tournament organizers</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Points and Rankings</h4>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Points are awarded based on tournament performance</li>
                  <li>Rankings are calculated using our ELO rating system</li>
                  <li>We reserve the right to adjust points for rule violations</li>
                  <li>Historical data may be reset periodically</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                All content on the Platform, including but not limited to text, graphics, logos,
                images, and software, is the property of BUG Gaming Club or its licensors and is
                protected by copyright and other intellectual property laws.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or lease any part of our services or
                included software without our express written permission.
              </p>
              <p>
                Game titles, logos, and trademarks mentioned on the Platform are the property of
                their respective owners. We claim no ownership of third-party intellectual property.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                The Platform is provided &quot;as is&quot; without warranties of any kind, either express or
                implied. We do not guarantee that the Platform will be uninterrupted, secure, or
                error-free.
              </p>
              <p>
                To the fullest extent permitted by law, BUG Gaming Club shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, or any loss of
                profits or revenues, whether incurred directly or indirectly.
              </p>
              <p>
                We are not responsible for any disputes between users or for the conduct of users
                on or off the Platform.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We reserve the right to suspend or terminate your account and access to the Platform
                at our sole discretion, without notice, for conduct that we believe:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Violates these Terms of Service</li>
                <li>Violates our Code of Conduct</li>
                <li>Is harmful to other users or the Platform</li>
                <li>Exposes us to legal liability</li>
                <li>Is fraudulent or involves illegal activity</li>
              </ul>
              <p className="mt-4">
                You may terminate your account at any time by contacting us. Upon termination,
                your right to use the Platform will immediately cease.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-primary" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may revise these Terms from time to time. The most current version will always
                be posted on this page with the &quot;Last Updated&quot; date.
              </p>
              <p>
                If we make material changes, we will notify you by email or through a notice on
                the Platform. Your continued use of the Platform after such changes constitutes
                your acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws,
                without regard to conflict of law principles.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the Platform shall be resolved
                through binding arbitration or in the courts of competent jurisdiction.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="glass bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Questions About These Terms?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <p>
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  Visit our contact page
                </Link>
              </p>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 text-muted-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Gaming Club</span>
          </div>
          <p className="text-muted-foreground mb-4">
            The ultimate destination for competitive gaming and community building.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
