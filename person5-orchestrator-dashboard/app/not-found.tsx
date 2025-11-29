import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-primary to-navy-secondary flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-cyan-primary mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-cyan-primary text-navy-primary font-semibold rounded-lg hover:bg-cyan-secondary transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-navy-secondary text-white font-semibold rounded-lg hover:bg-navy-primary transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}