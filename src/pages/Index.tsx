import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Shield,
  Zap,
  Heart,
  Award,
  TrendingUp,
  MessageSquare,
  Mail,
  Stethoscope,
  Brain,
  Activity
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface RealStats {
  totalSummaries: number;
  patientsImpacted: number;
  averageRating: number | null;
  providersUsingLiaise: number;
}

const Index = () => {
  const [stats, setStats] = useState<RealStats>({
    totalSummaries: 0,
    patientsImpacted: 0,
    averageRating: null,
    providersUsingLiaise: 0
  });
  const [loading, setLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<RealStats>({
    totalSummaries: 0,
    patientsImpacted: 0,
    averageRating: null,
    providersUsingLiaise: 0
  });
  const statsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated && !loading) {
          setHasAnimated(true);
          animateNumbers();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, loading]);

  const animateNumbers = () => {
    const duration = 600; // Reduced from 2000ms to 600ms (70% faster)
    const frameRate = 60;
    const totalFrames = (duration / 1000) * frameRate;
    let frame = 0;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setAnimatedStats({
        totalSummaries: Math.floor(stats.totalSummaries * easeProgress),
        patientsImpacted: Math.floor(stats.patientsImpacted * easeProgress),
        averageRating: stats.averageRating ? Number((stats.averageRating * easeProgress).toFixed(1)) : null,
        providersUsingLiaise: Math.floor(stats.providersUsingLiaise * easeProgress)
      });

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedStats(stats); // Ensure we end with exact values
      }
    };

    requestAnimationFrame(animate);
  };

  const fetchGlobalStats = async () => {
    try {
      // Call the edge function to get global statistics
      const { data, error } = await supabase.functions.invoke('get-global-stats');

      if (error) {
        console.error('Error fetching global stats:', error);
        return;
      }

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching global stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const realImpactStats = [
    {
      icon: FileText,
      title: "Summaries Generated",
      value: loading ? "..." : animatedStats.totalSummaries.toLocaleString(),
      description: "Medical reports transformed",
      gradient: "from-turquoise to-sky-blue"
    },
    {
      icon: Users,
      title: "Patients Impacted",
      value: loading ? "..." : animatedStats.patientsImpacted.toLocaleString(),
      description: "Unique patients reached",
      gradient: "from-sky-blue to-lavender"
    },
    {
      icon: Star,
      title: "Average Rating",
      value: loading ? "..." : animatedStats.averageRating ? `${animatedStats.averageRating}/5` : "No data",
      description: "User satisfaction score",
      gradient: "from-lavender to-turquoise"
    },
    {
      icon: Stethoscope,
      title: "Providers Using Liaise",
      value: loading ? "..." : animatedStats.providersUsingLiaise.toLocaleString(),
      description: "Healthcare professionals served",
      gradient: "from-turquoise to-lavender"
    }
  ];

  const features = [
    {
      icon: Stethoscope,
      title: "Medical Term Simplification",
      description: "Instantly translates complex medical jargon into easy-to-understand language.",
      gradient: "from-turquoise to-sky-blue"
    },
    {
      icon: Brain,
      title: "AI-Powered Summarization",
      description: "Uses advanced AI to extract key information and create concise patient summaries.",
      gradient: "from-sky-blue to-lavender"
    },
    {
      icon: Activity,
      title: "Real-Time Generation",
      description: "Generates summaries in real-time, allowing for immediate sharing with patients.",
      gradient: "from-lavender to-turquoise"
    }
  ];

  const steps = [
    {
      title: "Upload Report",
      description: "Upload the medical discharge summary you want to transform.",
      gradient: "from-turquoise to-sky-blue"
    },
    {
      title: "AI Simplification",
      description: "Our AI simplifies the medical terms and extracts key information.",
      gradient: "from-sky-blue to-lavender"
    },
    {
      title: "Share with Patient",
      description: "Share the easy-to-understand summary with your patient.",
      gradient: "from-lavender to-turquoise"
    }
  ];

  const trustIndicators = [
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Ensuring the highest standards of data privacy and security.",
      gradient: "from-turquoise to-sky-blue"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get patient-friendly summaries in seconds, not hours.",
      gradient: "from-sky-blue to-lavender"
    },
    {
      icon: Heart,
      title: "Improved Outcomes",
      description: "Enhance patient understanding and adherence to treatment plans.",
      gradient: "from-lavender to-turquoise"
    },
    {
      icon: Award,
      title: "Trusted by Professionals",
      description: "Used and trusted by healthcare providers nationwide.",
      gradient: "from-turquoise to-lavender"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 animate-fade-in-up">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-turquoise/10 text-turquoise border-turquoise/20 rounded-full px-4 py-2 text-sm font-medium animate-pulse-gentle">
                  🏥 Trusted by Healthcare Professionals
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-800 via-turquoise to-sky-blue bg-clip-text text-transparent leading-tight">
                  Transform Medical Reports into 
                  <span className="block text-turquoise">Patient-Friendly Summaries</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Liaise converts complex medical discharge summaries into clear, understandable language that patients can easily comprehend, improving health literacy and patient outcomes.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-gradient-to-r from-turquoise to-sky-blue hover:from-turquoise/90 hover:to-sky-blue/90 text-white px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg">
                    Start Converting Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" size="lg" className="border-2 border-turquoise/20 text-turquoise hover:bg-turquoise/5 px-8 py-4 rounded-full text-lg transition-all duration-300">
                    See How It Works
                    <Brain className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-turquoise/20 to-sky-blue/20 rounded-3xl blur-3xl animate-pulse-gentle"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-turquoise to-sky-blue rounded-xl flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Medical Report Upload</h3>
                    <p className="text-sm text-gray-500">Discharge Summary.pdf</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Document processed</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Medical terms simplified</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Patient summary generated</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-turquoise/5 to-sky-blue/5 rounded-xl">
                  <p className="text-sm text-gray-600">
                    "Your recent hospital visit summary is ready! We've explained everything in simple terms..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Impact Section */}
      <section ref={statsRef} className="py-20 bg-white/50 backdrop-blur-sm animate-fade-in-up">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-turquoise bg-clip-text text-transparent mb-6">
              Real Impact, Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the actual impact Liaise is making in healthcare communication across all our users
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {realImpactStats.map((stat, index) => (
              <Card key={index} className="glass-card border-0 text-center hover-lift group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</h3>
                  <p className="font-semibold text-gray-700 mb-1">{stat.title}</p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 animate-fade-in-up">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-turquoise bg-clip-text text-transparent mb-6">
              Powerful Features for Better Communication
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to transform complex medical language into patient-friendly summaries
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card border-0 hover-lift group">
                <CardHeader>
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-turquoise/5 to-sky-blue/5 animate-fade-in-up">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-turquoise bg-clip-text text-transparent mb-6">
              Simple Process, Powerful Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform medical reports in just a few clicks
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="glass-card border-0 text-center hover-lift group h-full">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl mx-auto mb-6 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300`}>
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-turquoise/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-20 animate-fade-in-up">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-turquoise bg-clip-text text-transparent mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with security, compliance, and patient care in mind
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustIndicators.map((indicator, index) => (
              <Card key={index} className="glass-card border-0 text-center hover-lift group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${indicator.gradient} rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <indicator.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{indicator.title}</h3>
                  <p className="text-sm text-gray-600">{indicator.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-turquoise via-sky-blue to-lavender animate-fade-in-up">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Improve Patient Communication?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join healthcare professionals who are already using Liaise to create better patient experiences through clear, understandable medical summaries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-white text-turquoise hover:bg-gray-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg transition-all duration-300">
                  View Pricing
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
