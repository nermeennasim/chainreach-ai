'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';

/**
 * ChainReach AI - Official Navbar Component
 * 
 * Features from master documentation:
 * - Navy background (#1a2332)
 * - White text with cyan accent on hover
 * - Active state highlighting with cyan underline
 * - Responsive mobile menu (hamburger)
 * - Logo on left (ChainReach logo)
 * - Navigation links: Home, Dashboard, Campaign
 * - User profile and logout functionality
 */

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('chainreach_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('chainreach_auth');
    localStorage.removeItem('chainreach_user');
    router.push('/login');
  };

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null;
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Campaign', href: '/campaign' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-navy-primary shadow-lg border-b border-navy-secondary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src="/gemini_logo_chainreach-03-white.png"
              alt="ChainReach AI"
              width={40}
              height={40}
              className="transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">
                ChainReach <span className="text-cyan-primary">[AI]</span>
              </span>
              <span className="text-gray-300 text-xs hidden sm:block">
                Compliance-First Marketing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 relative ${
                  isActive(link.href)
                    ? 'text-cyan-primary'
                    : 'text-white hover:text-cyan-primary hover:bg-navy-secondary'
                }`}
              >
                {link.name}
                {/* Active state underline */}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-primary"></span>
                )}
              </Link>
            ))}

            {/* User Menu */}
            {user && (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white hover:text-cyan-primary hover:bg-navy-secondary transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary rounded-md p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              // Close icon (X)
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-secondary border-t border-navy-primary">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-cyan-primary text-navy-primary'
                    : 'text-white hover:bg-navy-primary hover:text-cyan-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* User info and logout for mobile */}
            {user && (
              <div className="pt-4 pb-3 border-t border-navy-primary">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-navy-primary transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
