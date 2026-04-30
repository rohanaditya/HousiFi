'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Housifi</h1>
            <p className="text-gray-600">Welcome to your business hub</p>
          </div>

          {/* Sign In Form */}
          <div className="space-y-6">
            <button
              onClick={handleSignIn}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Go to Landing Page
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Click the button above to enter the application
          </p>
        </div>
      </div>
    </div>
  );
}
