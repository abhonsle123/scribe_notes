
import React, { useEffect } from 'react';
import { SignIn, useUser } from '@clerk/clerk-react';
import { FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Liaise</h1>
          </Link>
          <p className="text-gray-600 mt-2">Healthcare language, human understanding.</p>
        </div>

        <div className="flex justify-center">
          <SignIn 
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-lg border-0 rounded-lg",
                headerTitle: "text-2xl font-semibold",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                footerActionLink: "text-blue-600 hover:text-blue-800"
              }
            }}
          />
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            HIPAA compliant • Secure • Trusted by healthcare providers
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
