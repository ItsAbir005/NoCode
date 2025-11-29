import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Store token and redirect to dashboard
      localStorage.setItem('token', token);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else if (error) {
      // Redirect to login with error
      navigate(`/login?error=${error}`);
    } else {
      // No token or error, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mx-auto h-20 w-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
          <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Spinning Loader */}
        <div className="mt-8 flex justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Text */}
        <div className="mt-8 space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Completing authentication
          </h2>
          <p className="text-gray-600">
            Please wait while we sign you in...
          </p>
        </div>

        {/* Dots Animation */}
        <div className="mt-6 flex justify-center space-x-2">
          <div className="h-3 w-3 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="h-3 w-3 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="h-3 w-3 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;