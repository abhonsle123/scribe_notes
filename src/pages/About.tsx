
import { Heart, Users, Shield, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            About Liaise
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            We're on a mission to humanize healthcare communication through AI, making medical information accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Healthcare communication shouldn't be a barrier to understanding. Every patient deserves to fully comprehend their health information, treatment plans, and medical decisions.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Liaise bridges the gap between complex medical language and patient understanding, empowering individuals to take control of their health while reducing the administrative burden on healthcare providers.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-2xl">
                <Heart className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 text-center mb-4">
                  "To humanize healthcare communication through AI"
                </h3>
                <p className="text-slate-600 text-center">
                  Making every medical conversation clear, compassionate, and actionable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Story</h2>
          
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-8">
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Liaise was born from a simple observation: despite advances in medical technology, the fundamental challenge of communicating complex health information to patients remained unsolved. Too many patients left medical appointments confused, overwhelmed, or unclear about their next steps.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our founding team, with backgrounds in healthcare, AI, and patient advocacy, recognized that artificial intelligence could transform this challenge into an opportunity. By leveraging advanced language models trained specifically for medical communication, we could automatically translate complex medical documentation into clear, personalized explanations.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Today, Liaise serves healthcare providers across the country, helping them deliver better patient care while reducing administrative burdens. Every summary we generate represents a step toward a more accessible, understanding-centered healthcare system.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Values</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border border-slate-200">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl text-slate-900">Patient-Centered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Every decision we make prioritizes patient understanding and empowerment.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border border-slate-200">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl text-slate-900">Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  We maintain the highest standards of data security and patient privacy.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border border-slate-200">
              <CardHeader>
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl text-slate-900">Clinical Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Our AI maintains clinical accuracy while improving accessibility.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border border-slate-200">
              <CardHeader>
                <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-xl text-slate-900">Compassionate Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  We believe healthcare communication should be empathetic and human.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Leadership Team</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border border-slate-200 bg-white">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">SC</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Dr. Sarah Chen</h3>
                <p className="text-blue-600 font-medium mb-4">CEO & Co-Founder</p>
                <p className="text-slate-600 text-sm">
                  Former Chief Medical Officer with 15 years in healthcare technology. MD from Stanford, MBA from Wharton.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border border-slate-200 bg-white">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-purple-600">MR</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Michael Rodriguez</h3>
                <p className="text-purple-600 font-medium mb-4">CTO & Co-Founder</p>
                <p className="text-slate-600 text-sm">
                  AI/ML expert with 12 years building healthcare AI solutions. PhD in Computer Science from MIT.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border border-slate-200 bg-white">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-green-600">AJ</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Dr. Aisha Johnson</h3>
                <p className="text-green-600 font-medium mb-4">Chief Medical Officer</p>
                <p className="text-slate-600 text-sm">
                  Patient advocate and physician with expertise in health equity and communication. MD from Johns Hopkins.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Trusted Partners</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="h-12 bg-slate-200 rounded flex items-center justify-center">
              <span className="text-slate-500 font-medium">Healthcare Partner 1</span>
            </div>
            <div className="h-12 bg-slate-200 rounded flex items-center justify-center">
              <span className="text-slate-500 font-medium">Healthcare Partner 2</span>
            </div>
            <div className="h-12 bg-slate-200 rounded flex items-center justify-center">
              <span className="text-slate-500 font-medium">Healthcare Partner 3</span>
            </div>
            <div className="h-12 bg-slate-200 rounded flex items-center justify-center">
              <span className="text-slate-500 font-medium">Healthcare Partner 4</span>
            </div>
          </div>
          
          <div className="mt-12">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-6 py-2">
              SOC 2 Certified • HIPAA Compliant • Trusted by 500+ Providers
            </Badge>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
