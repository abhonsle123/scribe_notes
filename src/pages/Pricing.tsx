
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your practice. All plans include HIPAA-compliant security and 24/7 support.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Starter Plan */}
            <Card className="border-2 border-slate-200 relative">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-slate-900 mb-2">Starter</CardTitle>
                <p className="text-slate-600 mb-6">Perfect for solo clinics</p>
                <div className="text-center">
                  <span className="text-4xl font-bold text-slate-900">$49</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Up to 100 summaries/month</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">HIPAA-compliant data handling</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Email delivery</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Standard support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Basic customization</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-blue-500 relative bg-gradient-to-br from-blue-50 to-white">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Most Popular
              </Badge>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-slate-900 mb-2">Professional</CardTitle>
                <p className="text-slate-600 mb-6">Ideal for small practices</p>
                <div className="text-center">
                  <span className="text-4xl font-bold text-slate-900">$129</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Up to 500 summaries/month</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">HIPAA-compliant data handling</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Email & SMS delivery</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Advanced customization</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">EHR integration</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Analytics dashboard</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-slate-200 relative">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-slate-900 mb-2">Enterprise</CardTitle>
                <p className="text-slate-600 mb-6">For hospitals & networks</p>
                <div className="text-center">
                  <span className="text-4xl font-bold text-slate-900">Custom</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Unlimited summaries</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Full HIPAA compliance</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Multi-channel delivery</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Dedicated support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">White-label options</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-slate-700">Advanced analytics</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6 text-left">
            <Card className="border border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Can I change plans anytime?</h3>
                <p className="text-slate-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.</p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Is there a free trial?</h3>
                <p className="text-slate-600">We offer a 14-day free trial for all plans. No credit card required to get started.</p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">What happens if I exceed my summary limit?</h3>
                <p className="text-slate-600">We'll notify you when you're approaching your limit. You can upgrade your plan or purchase additional summaries as needed.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join hundreds of healthcare providers improving patient communication with Liaise.
          </p>
          
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
