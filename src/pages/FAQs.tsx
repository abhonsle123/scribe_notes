
import { useState } from "react";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FAQs = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      question: "Is Liaise HIPAA compliant?",
      answer: "Yes, Liaise is fully HIPAA compliant. We implement industry-leading security measures including end-to-end encryption, secure data storage, and strict access controls. Our platform undergoes regular security audits and maintains SOC 2 certification."
    },
    {
      question: "How do summaries get delivered to patients?",
      answer: "Summaries can be delivered through multiple channels including email, SMS, or directly through your existing patient portal. You can configure delivery preferences based on patient preferences and your practice's workflow."
    },
    {
      question: "Can I customize how summaries are written?",
      answer: "Absolutely! Liaise allows you to customize summary templates, adjust reading levels, and incorporate your practice's communication style. You can also set preferences for different patient populations and conditions."
    },
    {
      question: "What languages does Liaise support?",
      answer: "Liaise currently supports English and Spanish, with additional languages planned for future releases. Our AI can also adjust communication style based on cultural context and health literacy levels."
    },
    {
      question: "How secure is patient data?",
      answer: "Patient data security is our top priority. We use enterprise-grade encryption both in transit and at rest, maintain strict access controls, and follow zero-trust security principles. Data is never shared with third parties and is automatically purged according to your retention policies."
    },
    {
      question: "How does Liaise integrate with existing EHR systems?",
      answer: "Liaise offers seamless integration with major EHR systems including Epic, Cerner, and Allscripts. Our integration team works with you to ensure a smooth setup process with minimal disruption to your existing workflows."
    },
    {
      question: "What types of medical documents can Liaise process?",
      answer: "Liaise can process discharge summaries, visit notes, test results, treatment plans, and other clinical documentation. Our AI is trained on a wide variety of medical document types and specialties."
    },
    {
      question: "How long does it take to generate a summary?",
      answer: "Most summaries are generated within 30-60 seconds of upload. Complex documents may take up to 2 minutes. You'll receive real-time updates on processing status through our dashboard."
    },
    {
      question: "Can patients provide feedback on their summaries?",
      answer: "Yes, patients can rate their summaries and provide feedback, which helps our AI continuously improve. This feedback loop ensures summaries become more effective over time for your patient population."
    },
    {
      question: "What support is available during implementation?",
      answer: "We provide comprehensive onboarding support including training sessions, technical setup assistance, and ongoing customer success management. Our support team is available 24/7 for urgent issues."
    },
    {
      question: "How is pricing calculated?",
      answer: "Pricing is based on the number of summaries processed per month. We offer tiered plans to accommodate practices of all sizes, from solo practitioners to large health systems. Contact us for volume discounts."
    },
    {
      question: "Can I try Liaise before committing?",
      answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started. Our team can also provide a personalized demo to show how Liaise works with your specific use cases."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Everything you need to know about Liaise and how it transforms healthcare communication.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <Card key={index} className="border border-slate-200">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 pr-8">
                      {faq.question}
                    </h3>
                    {openItems.includes(index) ? (
                      <ChevronUp className="h-5 w-5 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                  {openItems.includes(index) && (
                    <div className="px-6 pb-6">
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Our team is here to help. Reach out and we'll get back to you within 24 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Mail className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Call
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQs;
