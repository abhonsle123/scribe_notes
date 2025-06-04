
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  Shield, 
  Award,
  Target,
  Lightbulb,
  Globe
} from "lucide-react";

const About = () => {
  useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-turquoise/10 text-turquoise border-turquoise/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
              About Liaise
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-800 via-turquoise to-sky-blue bg-clip-text text-transparent leading-tight mb-6">
              Bridging the Gap Between 
              <span className="block text-turquoise">Medical Complexity and Patient Understanding</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Liaise was created with a simple mission: to make healthcare communication clearer, 
              more accessible, and ultimately improve patient outcomes through better understanding.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Healthcare should be understandable. Too often, patients leave medical appointments 
                with discharge summaries filled with complex terminology that creates confusion rather than clarity.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Liaise transforms these complex medical documents into clear, patient-friendly summaries 
                that empower individuals to better understand their health and treatment plans.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-turquoise/20 to-sky-blue/20 rounded-3xl blur-3xl"></div>
              <Card className="relative glass-card border-0 p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-turquoise to-sky-blue rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Patient-Centered</h3>
                    <p className="text-sm text-gray-600">Designed with patients in mind</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-blue to-lavender rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">HIPAA Compliant</h3>
                    <p className="text-sm text-gray-600">Your data is secure</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-lavender to-turquoise rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Compassionate</h3>
                    <p className="text-sm text-gray-600">Built with empathy</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-turquoise to-lavender rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">Trusted</h3>
                    <p className="text-sm text-gray-600">Used by professionals</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-turquoise bg-clip-text text-transparent mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything we do is guided by these fundamental principles
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Clarity First",
                description: "We believe complex medical information should be accessible to everyone, regardless of their medical background.",
                gradient: "from-turquoise to-sky-blue"
              },
              {
                icon: Lightbulb,
                title: "Innovation",
                description: "We continuously improve our AI technology to provide better, more accurate translations of medical content.",
                gradient: "from-sky-blue to-lavender"
              },
              {
                icon: Globe,
                title: "Accessibility",
                description: "Healthcare information should be available and understandable to all people, everywhere.",
                gradient: "from-lavender to-turquoise"
              }
            ].map((value, index) => (
              <Card key={index} className="glass-card border-0 hover-lift group">
                <CardHeader>
                  <div className={`w-12 h-12 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-r from-turquoise/5 to-sky-blue/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-turquoise bg-clip-text text-transparent mb-6">
              Built by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team combines deep healthcare expertise with cutting-edge technology to create solutions that truly serve patients and providers.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card border-0 p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  "Having worked in healthcare for years, I've seen firsthand how communication barriers can impact patient care. 
                  Liaise was born from the need to bridge that gap and ensure every patient truly understands their health journey."
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-turquoise to-sky-blue rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">The Liaise Team</h3>
                    <p className="text-gray-600">Healthcare & Technology Professionals</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
