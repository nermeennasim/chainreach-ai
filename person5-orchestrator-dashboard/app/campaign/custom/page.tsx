'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CampaignDashboard from '@/components/campaign/CampaignDashboard';

export default function CustomCampaignPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-gradient text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/campaign">
            <Button variant="ghost" className="text-white hover:text-cyan-primary mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaign Hub
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Custom Campaign</h1>
          <p className="text-xl text-gray-200">
            Create and manage campaigns with full transparency and compliance
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CampaignDashboard />
      </div>
    </div>
  );
}
