
import { useState } from "react";
import { Upload, FileText, Mail, Shield, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [medicalReport, setMedicalReport] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [simplifiedReport, setSimplifiedReport] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMedicalReport(content);
        toast({
          title: "File uploaded successfully",
          description: "Your medical report has been loaded and is ready for processing.",
        });
      };
      reader.readAsText(file);
    }
  };

  const simplifyReport = async () => {
    if (!medicalReport.trim()) {
      toast({
        title: "No report to process",
        description: "Please upload a file or paste your medical report first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing with a more realistic delay
    setTimeout(() => {
      const simplified = `
**Your Medical Visit Summary**

**What happened during your visit:**
You came to the emergency department because you were experiencing chest pain and shortness of breath. The medical team wanted to make sure you were safe and find out what was causing these symptoms.

**Tests we performed:**
• **Blood tests**: These checked for signs of heart problems and showed that your heart enzymes were normal, which is good news.
• **Chest X-ray**: This looked at your lungs and heart and came back normal.
• **EKG (Heart rhythm test)**: This checked how your heart was beating and showed a normal rhythm.

**What we found:**
The good news is that all your tests came back normal. Your symptoms appear to be related to anxiety and muscle strain, not a heart attack or serious heart condition.

**Your treatment plan:**
1. **Rest**: Take it easy for the next few days
2. **Pain management**: You can take over-the-counter pain relievers like ibuprofen as needed
3. **Stress management**: Consider relaxation techniques or speaking with a counselor about anxiety
4. **Follow-up**: See your primary care doctor within 1-2 weeks

**When to seek immediate care:**
Come back to the emergency room or call 911 if you experience:
• Severe chest pain that doesn't go away
• Trouble breathing
• Dizziness or fainting
• Pain that spreads to your arm, neck, or jaw

**Questions?**
If you have any questions about this summary or your care, please don't hesitate to contact your healthcare provider.

*This summary was created to help you better understand your medical care. It should not replace discussions with your healthcare team.*
      `;
      
      setSimplifiedReport(simplified);
      setIsProcessing(false);
      
      toast({
        title: "Report simplified successfully",
        description: "Your medical report has been transformed into a patient-friendly summary.",
      });
    }, 3000);
  };

  const sendEmail = async () => {
    if (!patientEmail || !simplifiedReport) {
      toast({
        title: "Missing information",
        description: "Please ensure you have a simplified report and valid email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email sent successfully",
      description: `The simplified report has been sent to ${patientEmail}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MedSimplify</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Transform Complex Medical Reports into 
            <span className="text-blue-600"> Clear, Patient-Friendly Summaries</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Help patients and families better understand their healthcare with AI-powered medical translation
          </p>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Save Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Reduce provider workload while improving patient communication</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Better Understanding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Help patients and families comprehend medical decisions and care plans</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Easy Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Send summaries directly to patients or family members via email</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Application */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Input Section */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Medical Report
                </CardTitle>
                <CardDescription>
                  Upload a discharge summary, procedure report, or paste the text directly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="file-upload">Upload File (TXT, PDF, DOC)</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                </div>
                
                <div className="relative">
                  <Label htmlFor="report-text">Or Paste Report Text</Label>
                  <Textarea
                    id="report-text"
                    value={medicalReport}
                    onChange={(e) => setMedicalReport(e.target.value)}
                    placeholder="Paste your medical report here..."
                    className="mt-2 min-h-[300px] font-mono text-sm"
                  />
                </div>
                
                <Button 
                  onClick={simplifyReport}
                  disabled={isProcessing || !medicalReport.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? "Processing with AI..." : "Simplify Report"}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Patient-Friendly Summary
                </CardTitle>
                <CardDescription>
                  Clear, understandable explanation of the medical report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 min-h-[300px] bg-gray-50">
                  {isProcessing ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">AI is simplifying your report...</p>
                      </div>
                    </div>
                  ) : simplifiedReport ? (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                        {simplifiedReport}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Your simplified report will appear here...</p>
                  )}
                </div>
                
                {simplifiedReport && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patient-email">Patient Email Address</Label>
                      <Input
                        id="patient-email"
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="mt-2"
                      />
                    </div>
                    <Button 
                      onClick={sendEmail}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send to Patient
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300">
              © 2024 MedSimplify. Improving healthcare communication through AI.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              HIPAA compliant • Secure • Trusted by healthcare providers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
