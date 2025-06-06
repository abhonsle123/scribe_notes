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
      answer: "Coming Soon..."
    },
    {
      question: "How do summaries get delivered to patients?",
      answer: "Coming Soon..."
    },
    {
      question: "Can I customize how summaries are written?",
      answer: "Coming Soon..."
    },
    {
      question: "What languages does Liaise support?",
      answer: "Coming Soon..."
    },
    {
      question: "How secure is patient data?",
      answer: "Coming Soon..."
    },
    {
      question: "How does Liaise integrate with existing EHR systems?",
      answer: "Coming Soon..."
    },
    {
      question: "What types of medical documents can Liaise process?",
      answer: "Coming Soon..."
    },
    {
      question: "How long does it take to generate a summary?",
      answer: "Coming Soon..."
    },
    {
      question: "Can patients provide feedback on their summaries?",
      answer: "Coming Soon..."
    },
    {
      question: "What support is available during implementation?",
      answer: "Coming Soon..."
    },
    {
      question: "How is pricing calculated?",
      answer: "Coming Soon..."
    },
    {
      question: "Can I try Liaise before committing?",
      answer: "Coming Soon..."
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
