
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserButton } from "@clerk/clerk-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const navigation = [
    ...(user ? [{ name: "Dashboard", href: "/dashboard" }] : []),
    { name: "How it Works", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQs", href: "/faqs" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Liaise</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/contact">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                  >
                    Contact us
                  </Button>
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Log In
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="px-3 py-2 space-y-2">
                  <Link to="/contact">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact us
                    </Button>
                  </Link>
                  <div className="flex justify-center pt-2">
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <Link to="/login">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Log In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
