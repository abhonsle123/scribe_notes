
import { useState } from "react";
import { ArrowRight, Upload, FileText, Mail, Shield, Clock, Users, CheckCircle, Star, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left animate-fade-in">
              <Badge variant="secondary" className="mb-6 bg-sky-100 text-sky-700 border-sky-200 px-4 py-2">
                <Heart className="h-4 w-4 mr-2" />
                Caring Healthcare Communication
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
                From medical
                <span className="text-sky-600 block">to meaningful.</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
                Liaise transforms complex discharge summaries into warm, clear explanations that patients and families can truly understand and act upon.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-sky-300 text-sky-700 hover:bg-sky-50">
                  See How It Works
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  HIPAA Secure
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  Used by 500+ Providers
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  99.9% Accuracy
                </div>
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="relative lg:h-96 animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-3xl shadow-2xl"></div>
              <div className="relative p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Complex Medical Report</div>
                  <div className="my-4">
                    <ArrowRight className="h-6 w-6 text-sky-600 mx-auto animate-pulse" />
                  </div>
                  <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Patient-Friendly Summary</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Trusted by Healthcare Heroes</h2>
            <p className="text-lg text-slate-600">Join the providers making healthcare more human</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-3xl font-bold text-sky-600 mb-2">500+</div>
              <div className="text-slate-600">Healthcare Providers</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl font-bold text-emerald-600 mb-2">10k+</div>
              <div className="text-slate-600">Patients Helped</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-slate-600">Accuracy Rate</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.9★</div>
              <div className="text-slate-600">Patient Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Liaise Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-sky-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Why Families Choose Liaise</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Because understanding your health shouldn't require a medical degree
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-br from-sky-100 to-sky-200 p-6 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-10 w-10 text-sky-600" />
                </div>
                <CardTitle className="text-xl text-slate-800">Clear & Simple</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center leading-relaxed">
                  Complex medical terms become warm, understandable explanations that you and your family can actually use to make informed decisions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-br from-emerald-100 to-emerald-200 p-6 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-10 w-10 text-emerald-600" />
                </div>
                <CardTitle className="text-xl text-slate-800">Instant Understanding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center leading-relaxed">
                  No more waiting for callbacks or feeling lost. Get clear answers immediately, right when you need them most.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-slate-800">Family-Centered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center leading-relaxed">
                  Designed for the whole family to understand together, because healing happens best when everyone's on the same page.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">How Liaise Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform confusion into clarity
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-sky-200 via-emerald-200 to-purple-200"></div>
            
            <div className="text-center relative">
              <div className="mx-auto bg-gradient-to-br from-sky-500 to-sky-600 text-white p-8 rounded-full w-24 h-24 flex items-center justify-center mb-8 text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="mb-6">
                <div className="mx-auto bg-sky-100 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-sky-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Upload Your Report</h3>
              <p className="text-slate-600 leading-relaxed">
                Securely share your discharge summary or medical report through our simple, private upload system.
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 rounded-full w-24 h-24 flex items-center justify-center mb-8 text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="mb-6">
                <div className="mx-auto bg-emerald-100 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">AI Translation</h3>
              <p className="text-slate-600 leading-relaxed">
                Our caring AI reads between the lines and translates medical complexity into warm, human language.
              </p>
            </div>
            
            <div className="text-center relative">
              <div className="mx-auto bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-full w-24 h-24 flex items-center justify-center mb-8 text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="mb-6">
                <div className="mx-auto bg-purple-100 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Understand Together</h3>
              <p className="text-slate-600 leading-relaxed">
                Receive your personalized summary that the whole family can read, understand, and act upon with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Stories from Families Like Yours</h2>
            <p className="text-xl text-slate-600">
              Real experiences from people who found clarity when they needed it most
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 bg-gradient-to-br from-sky-50 to-white shadow-lg">
              <CardHeader>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription className="text-slate-700 text-base leading-relaxed">
                  "After my surgery, the medical report was like reading a foreign language. Liaise turned it into something my whole family could understand. We finally knew what to expect during recovery."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sky-700 font-semibold">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Maria Rodriguez</p>
                    <p className="text-sm text-slate-600">Patient & Mother</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-white shadow-lg">
              <CardHeader>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription className="text-slate-700 text-base leading-relaxed">
                  "As a doctor, I love seeing how Liaise helps my patients truly understand their care plans. Families leave my office confident and informed, not confused."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-emerald-700 font-semibold">JS</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Dr. James Sullivan</p>
                    <p className="text-sm text-slate-600">Family Medicine</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-white shadow-lg">
              <CardHeader>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription className="text-slate-700 text-base leading-relaxed">
                  "When Dad was in the hospital, we were overwhelmed by all the medical terms. Liaise gave us peace of mind by explaining everything in a way we could all understand."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-700 font-semibold">TC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Tom Chen</p>
                    <p className="text-sm text-slate-600">Family Caregiver</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Your Privacy is Sacred</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="bg-emerald-100 p-4 rounded-xl mb-4">
                <Shield className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">HIPAA Compliant</h3>
              <p className="text-slate-600 text-sm">Your health information stays private and secure, always</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-sky-100 p-4 rounded-xl mb-4">
                <CheckCircle className="h-12 w-12 text-sky-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Bank-Level Security</h3>
              <p className="text-slate-600 text-sm">Enterprise encryption protects every interaction</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-6 py-3">
            <CheckCircle className="h-4 w-4 mr-2" />
            Trusted by 500+ Healthcare Providers Nationwide
          </Badge>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sky-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Bridge the Gap?</h2>
          <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who've found clarity and peace of mind with Liaise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 text-lg px-8 py-4 shadow-lg">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white/10">
              Talk to Our Team
            </Button>
          </div>
          
          <p className="text-sm text-sky-200 mt-6">
            No credit card required • 14-day free trial • Setup in under 5 minutes
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
