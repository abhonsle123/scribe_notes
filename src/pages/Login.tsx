
import React, { useEffect } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Login = () => {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
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

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              {mode === 'login' ? (
                <SignIn 
                  fallbackRedirectUrl="/dashboard"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0",
                    }
                  }}
                />
              ) : (
                <SignUp 
                  fallbackRedirectUrl="/dashboard"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0",
                    }
                  }}
                />
              )}
            </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setMode('signup')}
                    >
                      Sign up
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setMode('login')}
                    >
                      Sign in
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
