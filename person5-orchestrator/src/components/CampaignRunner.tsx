'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, Users } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface CampaignRunnerProps {
  onCampaignComplete: (data: any) => void;
}

export function CampaignRunner({ onCampaignComplete }: CampaignRunnerProps) {
  const [loading, setLoading] = useState(false);
  const [customerCount, setCustomerCount] = useState(5);
  const [format, setFormat] = useState<'email' | 'sms' | 'social'>('email');

  const generateMockCustomers = (count: number): Customer[] => {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    return Array.from({ length: count }, (_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      return {
        id: `cust-${1000 + i}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      };
    });
  };

  const runCampaign = async () => {
    setLoading(true);
    try {
      const customers = generateMockCustomers(customerCount);
      
      const response = await fetch('/api/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customers,
          format,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onCampaignComplete(data);
      } else {
        console.error('Campaign failed:', data.error);
      }
    } catch (error) {
      console.error('Error running campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          Campaign Runner
        </CardTitle>
        <CardDescription>
          Configure and execute your marketing campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Customers</label>
          <Input
            type="number"
            min="1"
            max="50"
            value={customerCount}
            onChange={(e) => setCustomerCount(parseInt(e.target.value) || 1)}
            placeholder="Enter number of customers"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message Format</label>
          <div className="flex gap-2">
            {(['email', 'sms', 'social'] as const).map((f) => (
              <Button
                key={f}
                variant={format === f ? 'default' : 'outline'}
                onClick={() => setFormat(f)}
                className="flex-1"
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={runCampaign}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Campaign...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Campaign
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
