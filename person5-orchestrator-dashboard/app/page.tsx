import Link from 'next/link';
import { ArrowRight, Shield, Users, FileText, Sparkles, Send, CheckCircle } from 'lucide-react';

const agents = [
  {
    id: 1,
    name: 'Customer Segmentation',
    icon: <Users className="w-8 h-8" />,
    description: 'Analyzes 5000 customers and creates intelligent segments'
  },
  {
    id: 2,
    name: 'Content Retrieval',
    icon: <FileText className="w-8 h-8" />,
    description: 'Retrieves pre-approved marketing templates'
  },
  {
    id: 3,
    name: 'Content Generation',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Generates 3 personalized variants per customer'
  },
  {
    id: 4,
    name: 'Compliance & Safety',
    icon: <Shield className="w-8 h-8" />,
    description: 'Validates with Azure AI Content Safety'
  },
  {
    id: 5,
    name: 'Campaign Delivery',
    icon: <Send className="w-8 h-8" />,
    description: 'Sends only approved messages to customers'
  },
];

const team = [
  { name: 'Person 1', role: 'Customer Segmentation Agent' },
  { name: 'Person 2', role: 'Content Retrieval Agent' },
  { name: 'Person 3', role: 'Content Generation Agent' },
  { name: 'Person 4', role: 'Compliance & Safety Agent' },
  { name: 'Nermeen (You)', role: 'Campaign Orchestrator & Team Lead' },
];

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-navy-primary via-navy-secondary to-navy-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            ChainReach<span className="text-cyan-primary">AI</span>
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-cyan-primary mb-4">
            Compliance-First Marketing Automation
          </p>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Enterprise-grade AI that automates trust through mandatory safety validation. 
            Never worry about harmful content reaching your customers.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/campaign/demo" className="btn-primary inline-flex items-center">
              Start Demo Campaign
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="btn-secondary inline-flex items-center">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-primary mb-4">
              The Enterprise AI Problem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Companies want AI marketing automation but fear compliance risks and potential 
              PR disasters from unsafe AI-generated content.
            </p>
          </div>
        </div>
      </section>

      {/* Solution - 5 Agents */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-primary mb-4">
              Our Solution: Automated Trust
            </h2>
            <p className="text-xl text-gray-600">
              5 specialized AI agents working in sequence with mandatory safety validation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {agents.map((agent, index) => (
              <div key={agent.id} className="relative">
                <div className="card text-center hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-4 text-cyan-primary">
                    {agent.icon}
                  </div>
                  <h3 className="font-semibold text-navy-primary mb-2">
                    Agent {agent.id}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {agent.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {agent.description}
                  </p>
                </div>
                {index < agents.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-cyan-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy-primary text-center mb-12">
            Why ChainReach AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-primary rounded-full mb-4">
                <Shield className="w-8 h-8 text-navy-primary" />
              </div>
              <h3 className="text-xl font-semibold text-navy-primary mb-2">
                Mandatory Compliance
              </h3>
              <p className="text-gray-600">
                Every message must pass Azure AI Content Safety validation before sending
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-primary rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-navy-primary" />
              </div>
              <h3 className="text-xl font-semibold text-navy-primary mb-2">
                Pre-Approved Templates
              </h3>
              <p className="text-gray-600">
                Start with verified content, reducing risk while maintaining personalization
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-primary rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-navy-primary" />
              </div>
              <h3 className="text-xl font-semibold text-navy-primary mb-2">
                Real-Time Monitoring
              </h3>
              <p className="text-gray-600">
                Track every step of the campaign with live status updates and audit trails
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-navy-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-cyan-primary text-lg">
              Microsoft AI Innovation Challenge 2025 | Blue Sprout Agency
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="bg-navy-secondary rounded-lg p-4 mb-2">
                  <Users className="w-12 h-12 mx-auto text-cyan-primary" />
                </div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-cyan-primary to-cyan-secondary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-navy-primary mb-4">
            Ready to See It in Action?
          </h2>
          <p className="text-xl text-navy-secondary mb-8">
            Experience compliance-first marketing automation with our demo campaign
          </p>
          <Link href="/campaign/demo" className="inline-flex items-center px-8 py-4 bg-navy-primary text-white font-semibold rounded-lg hover:bg-navy-secondary transition-colors text-lg">
            Launch Demo Campaign
            <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}