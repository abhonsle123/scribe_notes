
import { useState } from "react";
import { ArrowRight, Upload, FileText, Mail, Shield, Clock, Users, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 border-blue-200">
            AI-Powered Healthcare Communication
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Healthcare language,
            <span className="text-blue-600 block">human understanding.</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Liaise converts discharge summaries into clear, personalized explanations — 
            empowering patients and saving providers time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
              Request a Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-slate-300">
              Watch Demo Video
            </Button>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-slate-500 mb-4">Trusted by healthcare providers nationwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="h-8 w-24 bg-slate-300 rounded"></div>
              <div className="h-8 w-24 bg-slate-300 rounded"></div>
              <div className="h-8 w-24 bg-slate-300 rounded"></div>
              <div className="h-8 w-24 bg-slate-300 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Liaise Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Liaise?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Bridge the communication gap between complex medical language and patient understanding
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-slate-900">Simplified Summaries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center">
                  Transform complex medical jargon into clear, understandable language that patients and families can easily comprehend.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-purple-200 transition-colors bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="text-center">
                <div className="mx-auto bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-slate-900">Time Saved for Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center">
                  Reduce administrative burden and free up valuable time for patient care with automated summary generation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-green-200 transition-colors bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-slate-900">Improved Patient Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-center">
                  Better understanding leads to improved compliance, reduced readmissions, and enhanced patient satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform complex medical reports into patient-friendly summaries
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mx-auto bg-blue-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mb-6 text-2xl font-bold">
                1
              </div>
              <div className="mb-4">
                <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Upload</h3>
              <p className="text-slate-600">
                Securely upload discharge summaries or visit reports through our HIPAA-compliant platform
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto bg-purple-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mb-6 text-2xl font-bold">
                2
              </div>
              <div className="mb-4">
                <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Summary</h3>
              <p className="text-slate-600">
                Our advanced AI reads, interprets, and creates personalized summaries in patient-friendly language
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto bg-green-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mb-6 text-2xl font-bold">
                3
              </div>
              <div className="mb-4">
                <Mail className="h-12 w-12 text-green-600 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Patient Delivery</h3>
              <p className="text-slate-600">
                Summaries are securely delivered to patients via email, SMS, or patient portal
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              See Detailed Process
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Healthcare Providers Say</h2>
            <p className="text-xl text-slate-600">
              Trusted by medical professionals across the country
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-slate-200">
              <CardHeader>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription>
                  "Liaise has transformed how we communicate with our patients. The summaries are clear, accurate, and our patients finally understand their treatment plans."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">DR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Dr. Sarah Chen</p>
                    <p className="text-sm text-slate-600">Family Medicine, Stanford Health</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200">
              <CardHeader>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription>
                  "We've seen a 40% reduction in follow-up calls asking for clarification. Patients are more engaged and compliant with their care plans."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-semibold">MJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Michael Johnson</p>
                    <p className="text-sm text-slate-600">Chief Medical Officer, City Hospital</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200">
              <CardHeader>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription>
                  "The time savings are incredible. What used to take 15 minutes per patient now happens automatically. Our staff can focus on direct patient care."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-semibold">LM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Dr. Lisa Martinez</p>
                    <p className="text-sm text-slate-600">Emergency Medicine Director</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Secure & HIPAA Compliant</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">HIPAA Compliant</h3>
              <p className="text-slate-600 text-sm">Full compliance with healthcare privacy regulations</p>
            </div>
            
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">SOC 2 Certified</h3>
              <p className="text-slate-600 text-sm">Industry-leading security and availability standards</p>
            </div>
            
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">End-to-End Encryption</h3>
              <p className="text-slate-600 text-sm">Your data is protected at every step</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Trusted by 500+ Healthcare Providers
          </Badge>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Patient Communication?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of healthcare providers who are already improving patient outcomes with Liaise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-slate-900">
              Schedule Demo
            </Button>
          </div>
          
          <p className="text-sm text-slate-400 mt-6">
            No credit card required • 14-day free trial • Setup in under 5 minutes
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
