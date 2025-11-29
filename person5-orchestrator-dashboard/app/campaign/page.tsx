'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Named export from shadcn/ui

/**
 * ChainReach AI - Campaign Hub Page
 * 
 * Based on master documentation wireframes:
 * Three campaign options:
 * 1. Demo Campaign - Pre-configured with 5000 sample customers
 * 2. Custom Campaign - Upload CSV and configure
 * 3. Message Validator - Test individual messages
 */

export default function CampaignHub() {
  return (
    <>
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-navy-gradient text-white py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Campaign Center</h1>
            <p className="text-xl text-gray-200">
              Choose how you want to run your campaign
            </p>
          </div>
        </section>

        {/* Campaign Options */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Demo Campaign */}
              <Card className="border-2 border-navy-primary hover:border-cyan-primary transition-all duration-300 hover:shadow-xl">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <CardTitle className="text-2xl text-navy-primary">Demo Campaign</CardTitle>
                  <CardDescription className="text-base">
                    Full orchestration with sample data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">5,000 sample customers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Full 5-agent orchestration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Real-time tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Compliance dashboard</span>
                    </div>
                  </div>
                  
                  <Link href="/campaign/demo" className="block">
                    <Button 
                      className="w-full bg-cyan-primary text-navy-primary hover:bg-cyan-secondary font-semibold"
                      size="lg"
                    >
                      Start Demo →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Custom Campaign */}
              <Card className="border-2 border-navy-primary hover:border-cyan-primary transition-all duration-300 hover:shadow-xl">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4">⚙️</div>
                  <CardTitle className="text-2xl text-navy-primary">Custom Campaign</CardTitle>
                  <CardDescription className="text-base">
                    Configure your own campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Upload customer CSV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Select customer IDs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Configure settings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Same powerful agents</span>
                    </div>
                  </div>
                  
                  <Link href="/campaign/custom" className="block">
                    <Button 
                      className="w-full bg-navy-primary text-white hover:bg-navy-secondary font-semibold"
                      size="lg"
                    >
                      Setup Custom →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Message Validator */}
              <Card className="border-2 border-navy-primary hover:border-cyan-primary transition-all duration-300 hover:shadow-xl">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4">🛡️</div>
                  <CardTitle className="text-2xl text-navy-primary">Message Validator</CardTitle>
                  <CardDescription className="text-base">
                    Test compliance for messages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Test individual messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">JSON format support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Instant safety check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success text-white">✓</Badge>
                      <span className="text-sm">Detailed safety scores</span>
                    </div>
                  </div>
                  
                  <Link href="/campaign/validate" className="block">
                    <Button 
                      className="w-full bg-navy-primary text-white hover:bg-navy-secondary font-semibold"
                      size="lg"
                    >
                      Validate Now →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Information Box */}
            <Card className="mt-12 bg-blue-50 border-info-blue">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">ℹ️</div>
                  <div>
                    <h3 className="font-bold text-navy-primary text-lg mb-2">HOW IT WORKS</h3>
                    <p className="text-gray-700 leading-relaxed">
                      All campaigns go through 5-agent orchestration with mandatory compliance validation. 
                      Every message is checked by Azure AI Content Safety before sending to customers. 
                      This ensures your marketing campaigns are both personalized and compliant.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
