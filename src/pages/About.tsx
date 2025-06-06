
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
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Kevin Gencel */}
            <div className="group perspective-1000">
              <div className="relative w-full h-80 transform-style-preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
                {/* Front of card */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                  <Card className="text-center border border-slate-200 bg-white h-full flex flex-col justify-center">
                    <CardContent className="p-8">
                      <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center mx-auto mb-6">
                        <Users className="h-16 w-16 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Kevin Gencel</h3>
                      <p className="text-blue-600 font-medium">Co-Founder and CEO</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Back of card */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                  <Card className="border border-slate-200 bg-white h-full">
                    <CardContent className="p-8 h-full flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Kevin Gencel</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Kevin is an undergraduate student at UNC Chapel Hill with a strong pre-med research background. 
                        His passion for healthcare and technology led him to co-found Liaise, where he combines his 
                        understanding of medical communication challenges with innovative AI solutions. Kevin's pre-med 
                        research experience gives him unique insights into the complexities of healthcare terminology 
                        and the critical need for clear patient communication. He is dedicated to bridging the gap 
                        between medical professionals and patients through accessible technology.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            
            {/* Arjun Bhonsle */}
            <div className="group perspective-1000">
              <div className="relative w-full h-80 transform-style-preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
                {/* Front of card */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                  <Card className="text-center border border-slate-200 bg-white h-full flex flex-col justify-center">
                    <CardContent className="p-8">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-16 w-16 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Arjun Bhonsle</h3>
                      <p className="text-purple-600 font-medium">Co-Founder and CEO</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Back of card */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                  <Card className="border border-slate-200 bg-white h-full">
                    <CardContent className="p-8 h-full flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Arjun Bhonsle</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Arjun is an undergraduate student at UNC Chapel Hill with a background in computer science 
                        and finance. His unique combination of technical expertise and financial acumen enables him 
                        to architect robust AI solutions while ensuring sustainable business growth. Arjun's computer 
                        science knowledge drives the development of Liaise's advanced natural language processing 
                        capabilities, while his finance background helps shape the company's strategic direction and 
                        scalable technology infrastructure.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
