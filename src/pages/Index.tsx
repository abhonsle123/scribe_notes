
import { useState, useEffect } from "react";
import { ArrowRight, Upload, FileText, Mail, Shield, Clock, Users, CheckCircle, Star, Heart, Brain, Zap, MessageCircle, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <Badge variant="secondary" className="bg-white/80 text-teal-600 border-teal-200 backdrop-blur-sm">
                <Zap className="h-4 w-4 mr-2" />
                AI-Powered Healthcare Communication
              </Badge>
              
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Healthcare,
                <span className="text-transparent bg-clip-text turquoise-gradient block">
                  simplified.
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Transform complex medical reports into clear, personalized summaries that patients and families can easily understand.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="border-teal-200 text-teal-600 hover:bg-teal-50 px-8 py-4 rounded-full text-lg transition-all duration-300">
                  Watch Demo
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-teal-500 mr-2" />
                  Free 14-day trial
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-teal-500 mr-2" />
                  HIPAA compliant
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-teal-500 mr-2" />
                  Setup in 5 minutes
                </div>
              </div>
            </div>
            
            <div className={`relative ${isVisible ? 'animate-float' : 'opacity-0'}`}>
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop&crop=center" 
                  alt="Healthcare AI Illustration" 
                  className="w-full h-auto rounded-3xl shadow-2xl"
                />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full opacity-20 animate-pulse-gentle"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20 animate-pulse-gentle" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 mb-8">Trusted by 500+ healthcare providers nationwide</p>
          <div className="flex justify-center items-center space-x-12 opacity-40">
            <div className="h-12 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-gray-400" />
            </div>
            <div className="h-12 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-gray-400" />
            </div>
            <div className="h-12 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-gray-400" />
            </div>
            <div className="h-12 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics Dashboard Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Impact, Real Results</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how Liaise is transforming healthcare communication across the country
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="glass-card hover-lift border-0 text-center">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-teal-500 mb-2">2.3M+</div>
                <div className="text-gray-600">Summaries Generated</div>
                <div className="flex items-center justify-center mt-2 text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +24% this month
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-lift border-0 text-center">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-blue-500 mb-2">94%</div>
                <div className="text-gray-600">Patient Satisfaction</div>
                <div className="flex items-center justify-center mt-2 text-green-500 text-sm">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  4.7/5 average rating
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-lift border-0 text-center">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-purple-500 mb-2">15min</div>
                <div className="text-gray-600">Time Saved per Summary</div>
                <div className="flex items-center justify-center mt-2 text-green-500 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  40hrs saved weekly
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-lift border-0 text-center">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-teal-500 mb-2">500+</div>
                <div className="text-gray-600">Healthcare Providers</div>
                <div className="flex items-center justify-center mt-2 text-green-500 text-sm">
                  <Users className="h-4 w-4 mr-1" />
                  Growing daily
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform complex medical reports into patient-friendly summaries
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="mx-auto bg-gradient-to-br from-teal-400 to-teal-600 text-white p-8 rounded-3xl w-24 h-24 flex items-center justify-center text-3xl font-bold mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  1
                </div>
                <div className="absolute -inset-4 bg-teal-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div className="mb-6">
                <Upload className="h-16 w-16 text-teal-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Upload Medical Report</h3>
              <p className="text-gray-600 leading-relaxed">
                Securely upload discharge summaries, lab results, or any medical documentation through our HIPAA-compliant platform
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="mx-auto bg-gradient-to-br from-blue-400 to-blue-600 text-white p-8 rounded-3xl w-24 h-24 flex items-center justify-center text-3xl font-bold mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  2
                </div>
                <div className="absolute -inset-4 bg-blue-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div className="mb-6">
                <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI Analysis & Translation</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI reads, interprets, and transforms medical jargon into clear, understandable language tailored for patients
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="mx-auto bg-gradient-to-br from-purple-400 to-purple-600 text-white p-8 rounded-3xl w-24 h-24 flex items-center justify-center text-3xl font-bold mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  3
                </div>
                <div className="absolute -inset-4 bg-purple-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div className="mb-6">
                <Mail className="h-16 w-16 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Deliver to Patients</h3>
              <p className="text-gray-600 leading-relaxed">
                Patient-friendly summaries are securely delivered via email, SMS, or patient portal with easy-to-understand explanations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 gradient-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Healthcare Professionals</h2>
            <p className="text-xl text-gray-600">
              See what doctors and patients are saying about Liaise
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card hover-lift border-0">
              <CardHeader>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  "Liaise has completely transformed how we communicate with patients. The summaries are incredibly clear and our patient satisfaction scores have increased by 40%."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">DR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Sarah Chen</p>
                    <p className="text-sm text-gray-600">Family Medicine, Stanford Health</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-lift border-0">
              <CardHeader>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  "Finally, my patients understand their discharge instructions! We've seen a 60% reduction in follow-up calls asking for clarification. Game changer."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">MJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Michael Johnson</p>
                    <p className="text-sm text-gray-600">Emergency Medicine, City Hospital</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-lift border-0">
              <CardHeader>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  "The time savings are incredible. What used to take 15 minutes per patient now happens automatically. Our staff can focus entirely on patient care."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">LM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Lisa Martinez</p>
                    <p className="text-sm text-gray-600">Chief Medical Officer, Regional Health</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold mb-6">Ready to Transform Patient Communication?</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of healthcare providers who are already improving patient outcomes and saving time with Liaise.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4 rounded-full text-lg transition-all duration-300">
              Schedule Demo
              <MessageCircle className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex justify-center items-center space-x-8 text-sm text-teal-100">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Setup in under 5 minutes
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
