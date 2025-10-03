'use client';

import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, UserCheck, Mail, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = "January 2025";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-white/80 mt-4">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Introduction */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Welcome to BUG Gaming Club (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you use our gaming platform
                and services.
              </p>
              <p>
                By using our services, you agree to the collection and use of information in accordance
                with this policy. If you do not agree with our policies and practices, please do not use
                our services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Personal Information</h4>
                <p>When you create an account, we collect:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Email address</li>
                  <li>Display name</li>
                  <li>Profile picture (optional)</li>
                  <li>Authentication credentials</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Gaming Activity Data</h4>
                <p>We automatically collect information about your gaming activities:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Tournament participation and results</li>
                  <li>Points and rankings</li>
                  <li>ELO ratings</li>
                  <li>Event registrations</li>
                  <li>Game preferences</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Technical Information</h4>
                <p>We collect technical data to improve our services:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Usage patterns and preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use the collected information for various purposes:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>To provide and maintain our gaming platform</li>
                <li>To manage your account and tournament registrations</li>
                <li>To calculate and display rankings and statistics</li>
                <li>To send you notifications about tournaments and events</li>
                <li>To improve our services and user experience</li>
                <li>To detect and prevent fraud or abuse</li>
                <li>To comply with legal obligations</li>
                <li>To communicate with you about updates and changes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Storage and Security */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-primary" />
                Data Storage and Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We use Firebase, a secure cloud platform by Google, to store and manage your data.
                Firebase implements industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Encrypted data transmission (HTTPS/SSL)</li>
                <li>Secure authentication systems</li>
                <li>Regular security updates and monitoring</li>
                <li>Access controls and permissions</li>
                <li>Data backup and recovery systems</li>
              </ul>
              <p className="mt-4">
                While we strive to protect your personal information, no method of transmission over
                the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We use the following third-party services that may collect information:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>
                  <strong className="text-foreground">Firebase (Google):</strong> For authentication,
                  database, and hosting services
                </li>
                <li>
                  <strong className="text-foreground">Google Authentication:</strong> For secure
                  sign-in functionality
                </li>
              </ul>
              <p className="mt-4">
                These services have their own privacy policies. We encourage you to review their
                privacy practices.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-foreground">Correction:</strong> Update or correct your information</li>
                <li><strong className="text-foreground">Deletion:</strong> Request deletion of your account and data</li>
                <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong className="text-foreground">Data Portability:</strong> Request your data in a portable format</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Children&apos;s Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Our services are not intended for children under 13 years of age. We do not knowingly
                collect personal information from children under 13. If you are a parent or guardian
                and believe your child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes
                are effective when posted on this page.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="glass bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Mail className="h-5 w-5 mr-2" />
                Contact Us About Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="space-y-2">
                <p>
                  <strong className="text-foreground">Email:</strong>{' '}
                  <a href="mailto:privacy@buggamingclub.com" className="text-primary hover:underline">
                    privacy@buggamingclub.com
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Contact Form:</strong>{' '}
                  <Link href="/contact" className="text-primary hover:underline">
                    Visit our contact page
                  </Link>
                </p>
              </div>
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
