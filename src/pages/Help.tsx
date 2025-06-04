
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageCircle, Mail, Phone, Book } from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Help Center</h1>
          
          <p className="text-lg text-gray-600 mb-12">
            Get help with Liaise and find answers to frequently asked questions.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Mail className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Email Support</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a href="mailto:support@liaise.com" className="text-blue-600 hover:text-blue-800 font-medium">
                support@liaise.com
              </a>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Phone className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Phone Support</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Call us during business hours (9 AM - 6 PM EST).
              </p>
              <a href="tel:919-903-7114" className="text-green-600 hover:text-green-800 font-medium">
                919-903-7114
              </a>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How does Liaise work?</h3>
                <p className="text-gray-700">
                  Liaise uses advanced AI to analyze medical reports and translate complex medical terminology 
                  into clear, patient-friendly language. Simply upload your medical document, and we'll 
                  generate a summary that's easy to understand.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my medical data secure?</h3>
                <p className="text-gray-700">
                  Yes, absolutely. We use enterprise-grade security measures including end-to-end encryption, 
                  HIPAA compliance, and secure cloud infrastructure to protect your sensitive medical information.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What file formats are supported?</h3>
                <p className="text-gray-700">
                  Liaise supports PDF files, Word documents, and image files (JPG, PNG). We can process 
                  most standard medical report formats.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does processing take?</h3>
                <p className="text-gray-700">
                  Most medical reports are processed within 1-2 minutes. Complex documents may take up to 5 minutes. 
                  You'll receive an email notification when your summary is ready.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I share summaries with family members?</h3>
                <p className="text-gray-700">
                  Yes, you can email summaries directly to family members or caregivers from within the 
                  Liaise platform. This makes it easy to keep everyone informed about your health.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Create your free Liaise account</li>
              <li>Upload your medical report or document</li>
              <li>Wait for AI processing (1-2 minutes)</li>
              <li>Review your patient-friendly summary</li>
              <li>Share with family or save for your records</li>
            </ol>
          </section>

          <section className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-700 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:support@liaise.com" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
              <a 
                href="tel:919-903-7114" 
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
