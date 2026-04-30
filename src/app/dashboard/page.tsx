'use client';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-indigo-600">Housifi</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Housifi!
          </h1>
          <p className="text-gray-600 text-lg">
            You have successfully accessed the landing page
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
            <p className="text-gray-600">
              Welcome to your business hub. Explore all the features available in your dashboard.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
            <p className="text-gray-600">
              Access all your business tools and services in one centralized location.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Support</h3>
            <p className="text-gray-600">
              Need help? Check out our documentation or contact our support team.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
