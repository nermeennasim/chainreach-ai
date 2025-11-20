'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleEnterDashboard = () => {
    router.push('/dashboard')
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              ChainReach AI
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => scrollToSection('home')}
                className={`text-white font-medium hover:text-white/80 transition-colors ${activeSection === 'home' ? 'border-b-2 border-white' : ''}`}
              >
                HOME
              </button>
              <Link href="/campaign">
                <button className="text-white font-medium hover:text-white/80 transition-colors">
                  CAMPAIGN
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="text-white font-medium hover:text-white/80 transition-colors">
                  DASHBOARD
                </button>
              </Link>
              <button 
                onClick={() => scrollToSection('about-us')}
                className={`text-white font-medium hover:text-white/80 transition-colors ${activeSection === 'about-us' ? 'border-b-2 border-white' : ''}`}
              >
                ABOUT US
              </button>
              <button 
                onClick={() => scrollToSection('about-project')}
                className={`text-white font-medium hover:text-white/80 transition-colors ${activeSection === 'about-project' ? 'border-b-2 border-white' : ''}`}
              >
                ABOUT PROJECT
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* HOME Section */}
      <section id="home" className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        {loading ? (
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-lg rounded-full border-4 border-white/20 shadow-2xl">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 animate-pulse">
              ChainReach AI
            </h1>
            <p className="text-xl text-white/80">Initializing Orchestrator...</p>
          </div>
        ) : (
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 backdrop-blur-lg rounded-full border-4 border-white/20 shadow-2xl mb-6">
                <span className="text-6xl">🔗</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                ChainReach AI
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 font-light mb-6">
                Multi-Agent Marketing Orchestration
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
            </div>

            <div className="mb-12 space-y-4">
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                AI-powered campaign orchestration with 5 intelligent agents working in harmony
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm md:text-base">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
                   Segmentation
                </span>
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
                   Content Strategy
                </span>
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
                   GPT-4 Generation
                </span>
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
                   Content Safety
                </span>
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
                   Orchestration
                </span>
              </div>
            </div>

            <button
              onClick={handleEnterDashboard}
              className="group relative inline-flex items-center gap-3 px-12 py-5 text-xl font-semibold text-purple-900 bg-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>View Dashboard</span>
              <svg 
                className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">5</div>
                <div className="text-sm text-white/70">Active Agents</div>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">5000+</div>
                <div className="text-sm text-white/70">Customers</div>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">184%</div>
                <div className="text-sm text-white/70">ROI Boost</div>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">Real-time</div>
                <div className="text-sm text-white/70">Analytics</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ABOUT US Section */}
      <section id="about-us" className="relative z-10 min-h-screen px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-white/80 text-xl">
              Five talented individuals working together to revolutionize AI-powered marketing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Person 1</h3>
              <p className="text-white/90 font-medium mb-2">Segmentation Lead</p>
              <p className="text-sm text-white/70 mb-3">Machine Learning Expert</p>
              <div className="text-xs text-white/60">
                <p>• ML-based customer segmentation</p>
                <p>• Deep learning models</p>
                <p>• FastAPI deployment</p>
              </div>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">Person 2</h3>
              <p className="text-white/90 font-medium mb-2">Content Strategy Lead</p>
              <p className="text-sm text-white/70 mb-3">Database & LangChain Expert</p>
              <div className="text-xs text-white/60">
                <p>• PostgreSQL architecture</p>
                <p>• LangChain integration</p>
                <p>• Content retrieval system</p>
              </div>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">Person 3</h3>
              <p className="text-white/90 font-medium mb-2">AI Generation Lead</p>
              <p className="text-sm text-white/70 mb-3">Azure AI Foundry Specialist</p>
              <div className="text-xs text-white/60">
                <p>• GPT-4 integration</p>
                <p>• Azure AI Agents</p>
                <p>• Message generation</p>
              </div>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-white mb-2">Person 4</h3>
              <p className="text-white/90 font-medium mb-2">Compliance Lead</p>
              <p className="text-sm text-white/70 mb-3">Content Safety Expert</p>
              <div className="text-xs text-white/60">
                <p>• Azure Content Safety</p>
                <p>• Compliance validation</p>
                <p>• Risk assessment</p>
              </div>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-all ring-2 ring-white/40">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">Person 5</h3>
              <p className="text-white/90 font-medium mb-2">Integration Lead</p>
              <p className="text-sm text-white/70 mb-3">Orchestration Expert</p>
              <div className="text-xs text-white/60">
                <p>• Multi-agent orchestration</p>
                <p>• Dashboard development</p>
                <p>• Real-time analytics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT PROJECT Section */}
      <section id="about-project" className="relative z-10 min-h-screen px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">About ChainReach AI</h2>
            <p className="text-white/80 text-xl">
              Revolutionizing Marketing with Multi-Agent AI Orchestration
            </p>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">🎯 Project Overview</h3>
              <p className="text-white/80 leading-relaxed">
                ChainReach AI is an innovative multi-agent orchestration platform designed for modern marketing campaigns. 
                Our system leverages 5 specialized AI agents working in harmony to deliver personalized, compliant, and 
                effective marketing messages at scale.
              </p>
            </div>

            <div className="p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">🔧 Technology Stack</h3>
              <div className="grid grid-cols-2 gap-4 text-white/80">
                <div>
                  <p className="font-semibold text-white mb-2">Backend</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Azure AI Foundry</li>
                    <li>• FastAPI</li>
                    <li>• PostgreSQL</li>
                    <li>• LangChain</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">Frontend</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Next.js 14</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• Real-time Analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">✨ Key Features</h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-semibold text-white">Intelligent Segmentation</p>
                    <p className="text-sm">ML-powered customer segmentation based on behavior and demographics</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="font-semibold text-white">AI Content Generation</p>
                    <p className="text-sm">GPT-4 powered personalized message creation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-white">Automated Compliance</p>
                    <p className="text-sm">Azure Content Safety ensures all messages meet regulatory standards</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="font-semibold text-white">Real-time Analytics</p>
                    <p className="text-sm">Live dashboards tracking campaign performance and agent health</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">🏆 Built For</h3>
              <p className="text-white/80 leading-relaxed">
                <strong className="text-white">Microsoft Innovative Challenge Fall 2025</strong><br />
                A hackathon project showcasing the power of Azure AI and multi-agent systems in solving 
                real-world marketing challenges. Our platform demonstrates how AI agents can work together 
                to create personalized, compliant, and effective marketing campaigns at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-white/60 text-sm border-t border-white/20">
        <p>ChainReach AI | Microsoft Innovative Challenge Fall 2025</p>
        <p className="mt-2">Team of 5 - Building the Future of AI Marketing 🚀</p>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </main>
  )
}
