import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Activity,
  Mic,
  FileCheck,
  Bot,
  Sparkles
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicalAnimation3D from "@/components/MedicalAnimation3D";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RealStats {
  totalSummaries: number;
  patientsImpacted: number;
  averageRating: number | null;
  providersUsingLiaise: number;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    const duration = 1300; // Changed from 2000ms to 1300ms
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

  const handleStartConverting = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const realImpactStats = [
    {
      icon: FileText,
      title: "Content Generated",
      value: loading ? "..." : animatedStats.totalSummaries.toLocaleString(),
      description: "Reports, notes & summaries",
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
      value: loading ? "..." : animatedStats.averageRating ? `${animatedStats.averageRating}/10` : "No data",
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
      icon: Mic,
      title: "AI Vocal Transcription & EHR Integration",
      description: "Automatically transcribe voice recordings and populate EHR notes with AI-powered accuracy and efficiency.",
      gradient: "from-turquoise to-sky-blue"
    },
    {
      icon: FileCheck,
      title: "Customizable AI Discharge Reports",
      description: "Generate personalized after-visit summaries with direct patient delivery, tailored to individual needs and medical complexity.",
      gradient: "from-sky-blue to-lavender"
    },
    {
      icon: Bot,
      title: "AI Patient Care Chatbox",
      description: "Enable patients to ask questions about their care plans and procedures, with AI providing immediate, accurate responses for both patients and providers.",
      gradient: "from-lavender to-turquoise"
    }
  ];

  const trustIndicators = [
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Ensuring the highest standards of data privacy and security for all voice recordings and documents.",
      gradient: "from-turquoise to-sky-blue"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get transcriptions and patient-friendly summaries in seconds, not hours.",
      gradient: "from-sky-blue to-lavender"
    },
    {
      icon: Heart,
      title: "Improved Outcomes",
      description: "Enhance patient understanding through both written summaries and verbal communication insights.",
      gradient: "from-lavender to-turquoise"
    },
    {
      icon: Award,
      title: "Trusted by Professionals",
      description: "Used for voice transcription and document processing by healthcare providers nationwide.",
      gradient: "from-turquoise to-lavender"
    }
  ];

  return (
    <div className="min-h-screen medical-gradient-bg">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-40">
        <MedicalAnimation3D />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <Badge className="bg-turquoise/10 text-turquoise border-turquoise/20 rounded-full px-6 py-3 text-sm font-medium animate-pulse-gentle backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Register your practice now!
                </Badge>
                <h1 className="text-6xl lg:text-8xl font-black bg-gradient-to-r from-gray-900 via-turquoise to-sky-blue bg-clip-text text-transparent leading-[0.9] tracking-tight">
                  Transform 
                  <span className="block text-turquoise">Medical Communication</span>
                  <span className="block text-4xl lg:text-5xl font-bold mt-4 text-gray-700">
                    with AI Voice & Document Processing
                  </span>
                </h1>
                <p className="text-2xl text-gray-600 leading-relaxed max-w-2xl font-medium">
                  Liaise converts voice recordings into clinical notes and transforms complex medical documents into clear, patient-friendly summaries, revolutionizing healthcare communication.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-turquoise to-sky-blue hover:from-turquoise/90 hover:to-sky-blue/90 text-white px-10 py-6 rounded-2xl text-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-turquoise/25"
                  onClick={handleStartConverting}
                >
                  Start Converting Now
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                <Link to="/how-it-works">
                  <Button variant="outline" size="lg" className="border-2 border-turquoise/30 text-turquoise hover:bg-turquoise/10 px-10 py-6 rounded-2xl text-xl font-semibold transition-all duration-300 backdrop-blur-sm">
                    See How It Works
                    <Brain className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-turquoise/30 to-sky-blue/30 rounded-3xl blur-3xl animate-pulse-gentle"></div>
              <div className="relative glass-hero p-10 rounded-3xl shadow-2xl border border-gray-100 transform hover:scale-105 transition-all duration-500">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-turquoise to-sky-blue rounded-2xl flex items-center justify-center shadow-lg">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Voice & Document Processing</h3>
                    <p className="text-gray-500">Audio Recording & Report Upload</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="text-gray-700 font-medium">Voice transcribed to clinical notes</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="text-gray-700 font-medium">Medical documents processed</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="text-gray-700 font-medium">Patient summaries generated</span>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-turquoise/10 to-sky-blue/10 rounded-2xl backdrop-blur-sm">
                  <p className="text-gray-600 font-medium">
                    "Your consultation recording and visit summary are ready! We've explained everything in simple terms..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Impact Section */}
      <section ref={statsRef} className="py-24 bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-800 to-turquoise bg-clip-text text-transparent mb-8">
              Real Impact, Real Results
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
              See the actual impact Liaise is making in healthcare communication through voice transcription and document processing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {realImpactStats.map((stat, index) => (
              <Card key={index} className="glass-card border-0 text-center hover-lift group backdrop-blur-xl">
                <CardContent className="p-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${stat.gradient} rounded-3xl mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <stat.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-gray-800 mb-3">{stat.value}</h3>
                  <p className="font-bold text-gray-700 mb-2 text-lg">{stat.title}</p>
                  <p className="text-gray-500">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-800 to-turquoise bg-clip-text text-transparent mb-8">
              Powerful Features for Better Communication
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
              Everything you need to transform voice recordings and complex medical language into patient-friendly summaries
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card border-0 hover-lift group backdrop-blur-xl">
                <CardHeader className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-800 font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <CardDescription className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-24 bg-gradient-to-r from-turquoise/10 to-sky-blue/10 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-800 to-turquoise bg-clip-text text-transparent mb-8">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
              Built with security, compliance, and patient care in mind for all voice and document processing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {trustIndicators.map((indicator, index) => (
              <Card key={index} className="glass-card border-0 text-center hover-lift group backdrop-blur-xl">
                <CardContent className="p-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${indicator.gradient} rounded-3xl mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <indicator.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{indicator.title}</h3>
                  <p className="text-gray-600">{indicator.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-turquoise via-sky-blue to-lavender relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-turquoise/90 via-sky-blue/90 to-lavender/90"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-8">
              Ready to Transform Healthcare Communication?
            </h2>
            <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Join healthcare professionals who are already using Liaise for voice transcription, document processing, and creating better patient experiences through clear, understandable medical summaries.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-white text-turquoise hover:bg-gray-50 px-10 py-6 rounded-2xl text-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl"
                >
                  Get Started Free
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 px-10 py-6 rounded-2xl text-xl font-semibold transition-all duration-300 backdrop-blur-sm">
                  View Pricing
                  <Heart className="ml-3 h-6 w-6" />
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
