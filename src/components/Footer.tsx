
import { Mail, Phone, MapPin, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Liaise</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Transforming complex medical reports into clear, patient-friendly summaries 
              through AI-powered medical translation. Improving healthcare communication 
              for providers and patients.
            </p>
            <p className="text-sm text-gray-400">
              HIPAA compliant • Secure • Trusted by healthcare providers
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">support@liaise.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">1-800-MED-HELP</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="/privacy" className="block text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="block text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/security" className="block text-gray-300 hover:text-white transition-colors">
                Security
              </a>
              <a href="/help" className="block text-gray-300 hover:text-white transition-colors">
                Help Center
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Liaise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
