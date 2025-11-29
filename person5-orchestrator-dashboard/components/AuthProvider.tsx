'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authToken = localStorage.getItem('chainreach_auth');
      const authTokenExpiry = localStorage.getItem('chainreach_auth_expiry');
      const now = Date.now();
      
      // Check if token exists and is not expired
      const isTokenValid = authToken && authTokenExpiry && now < Number(authTokenExpiry);
      
      if (!isTokenValid && pathname !== '/login') {
        // Not authenticated or token expired and not on login page - redirect to login
        // Optionally, clear invalid token
        localStorage.removeItem('chainreach_auth');
        localStorage.removeItem('chainreach_auth_expiry');
        router.push('/login');
        setIsAuthenticated(false);
      } else if (isTokenValid && pathname === '/login') {
        // Authenticated but on login page - redirect to home
        router.push('/');
        setIsAuthenticated(true);
      } else {
        // All good
        setIsAuthenticated(!!isTokenValid);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading spinner while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading ChainReach AI...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
