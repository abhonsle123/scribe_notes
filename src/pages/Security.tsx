
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Server, Eye } from "lucide-react";

const Security = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Security & Compliance</h1>
          
          <p className="text-lg text-gray-600 mb-12">
            Your medical data security is our top priority. Learn about our comprehensive security measures.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">HIPAA Compliant</h3>
              </div>
              <p className="text-gray-700">
                We maintain strict HIPAA compliance standards to protect your protected health information (PHI).
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Lock className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">End-to-End Encryption</h3>
              </div>
              <p className="text-gray-700">
                All data is encrypted in transit and at rest using industry-standard AES-256 encryption.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Server className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Secure Infrastructure</h3>
              </div>
              <p className="text-gray-700">
                Our infrastructure is hosted on secure, certified cloud platforms with 99.9% uptime guarantee.
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 text-orange-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Access Controls</h3>
              </div>
              <p className="text-gray-700">
                Strict access controls ensure only authorized personnel can access systems and data.
              </p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection Measures</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Multi-factor authentication for all user accounts</li>
              <li>Regular security audits and penetration testing</li>
              <li>Automated backup and disaster recovery procedures</li>
              <li>24/7 security monitoring and incident response</li>
              <li>Employee security training and background checks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Compliance Certifications</h2>
            <p className="text-gray-700 mb-4">
              Liaise maintains compliance with the following standards:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>HIPAA (Health Insurance Portability and Accountability Act)</li>
              <li>SOC 2 Type II compliance</li>
              <li>GDPR (General Data Protection Regulation)</li>
              <li>ISO 27001 security management standards</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Report Security Issues</h2>
            <p className="text-gray-700">
              If you discover a security vulnerability, please report it immediately to our security team 
              at security@liaise.com. We take all security reports seriously and will respond promptly.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Security;
