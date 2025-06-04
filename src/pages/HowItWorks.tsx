
import { Upload, FileText, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            How Liaise Works
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Transform complex medical reports into patient-friendly summaries in three simple steps
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="mx-auto bg-blue-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mb-6 text-2xl font-bold">
                  1
                </div>
                <div className="mb-4">
                  <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                </div>
                <CardTitle className="text-2xl text-slate-900 mb-4">Upload Document</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Securely upload discharge summaries, visit reports, or any medical documentation through our secure platform. Our system accepts multiple file formats including PDF, DOC, and direct text input.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="mx-auto bg-purple-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mb-6 text-2xl font-bold">
                  2
                </div>
                <div className="mb-4">
                  <FileText className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                </div>
                <CardTitle className="text-2xl text-slate-900 mb-4">AI Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Our advanced AI reads and interprets complex medical language, identifies key information, and creates personalized summaries tailored to the patient's literacy level and cultural background.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="mx-auto bg-green-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mb-6 text-2xl font-bold">
                  3
                </div>
                <div className="mb-4">
                  <Mail className="h-16 w-16 text-green-600 mx-auto mb-4" />
                </div>
                <CardTitle className="text-2xl text-slate-900 mb-4">Secure Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Patient-friendly summaries are securely delivered via email, SMS, or directly through your existing patient portal system. Patients receive clear, actionable healthcare information they can understand.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            What Makes Liaise Different
          </h2>
          
          <div className="space-y-8">
            <Card className="border border-slate-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Personalized Communication</h3>
                <p className="text-slate-600">
                  Every summary is tailored to the individual patient, considering their health literacy level, preferred language, and cultural context to ensure maximum understanding.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Clinical Accuracy</h3>
                <p className="text-slate-600">
                  Our AI maintains clinical precision while translating complex medical terms into accessible language, ensuring no critical information is lost in translation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Seamless Integration</h3>
                <p className="text-slate-600">
                  Liaise integrates with your existing EHR systems and communication platforms, requiring minimal workflow changes while delivering maximum impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">See Liaise in Action</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Ready to transform how you communicate with patients? Request a personalized demo today.
          </p>
          
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
            Request a Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
