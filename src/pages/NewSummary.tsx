
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  Edit,
  Send,
  Eye,
  AlertCircle
} from "lucide-react";

const NewSummary = () => {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerateSummary = async () => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setIsProcessed(true);
    }, 3000);
  };

  const mockSummary = `
  Dear John,

  Thank you for your recent visit to City General Hospital. Here's a simple explanation of your care and what happens next:

  **Why you came to the hospital:**
  You came in because you were having chest pain and trouble breathing.

  **What we found:**
  Our tests showed that you had a minor heart attack. This happens when one of the blood vessels to your heart gets blocked.

  **What we did to help:**
  - We gave you medicine to help your heart and prevent blood clots
  - We did a procedure to open the blocked blood vessel
  - We monitored your heart for 3 days to make sure you were getting better

  **How you're doing now:**
  Your heart is working much better now. Your tests before leaving showed good improvement.

  **What you need to do at home:**
  - Take your new heart medicines exactly as prescribed
  - Rest for the first week, then slowly increase your activity
  - Come back if you have chest pain, shortness of breath, or feel dizzy
  - Follow up with Dr. Smith in 1 week

  **Important medicines to take:**
  - Aspirin 81mg once daily
  - Metoprolol 50mg twice daily
  - Atorvastatin 40mg once daily at bedtime

  If you have any questions or concerns, please call us at (555) 123-4567.

  Take care,
  The Care Team at City General Hospital
  `;

  if (isProcessed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Summary Generated</h1>
            <p className="text-gray-600 mt-1">Review and send your patient summary</p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Ready to Send
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Patient Summary Preview
                </CardTitle>
                <CardDescription>
                  AI-generated summary in patient-friendly language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-800">
                      {mockSummary}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Summary
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Send to Patient
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Options</CardTitle>
                <CardDescription>Choose how to send this summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send via SMS
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send to Patient Portal
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium">2.3 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Readability Score:</span>
                  <span className="font-medium">Grade 8 Level</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Word Count:</span>
                  <span className="font-medium">287 words</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-green-100 text-green-700 text-xs">Ready</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing Summary</h1>
          <p className="text-gray-600">Our AI is converting your discharge summary to patient-friendly language...</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-lg font-semibold mb-2">Generating Patient Summary</h3>
            <p className="text-gray-600 mb-6">
              This typically takes 2-3 minutes. We're analyzing the medical content and translating it into clear, understandable language.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Document uploaded and validated
              </div>
              <div className="flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                AI analyzing medical content...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Summary</h1>
        <p className="text-gray-600 mt-1">
          Upload a discharge summary to generate a patient-friendly version
        </p>
      </div>

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">HIPAA Compliant & Secure</span>
            <span className="text-green-700">• End-to-end encryption • Data not stored</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Upload */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Discharge Summary</CardTitle>
              <CardDescription>
                Upload a PDF file containing the patient's discharge summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-4">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-green-800">{file.name}</p>
                      <p className="text-green-600">File ready for processing</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setFile(null)}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">
                        Drop your PDF here, or click to browse
                      </p>
                      <p className="text-gray-500">PDF files only, max 10MB</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Choose File
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Optional Notes */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Additional Notes (Optional)</CardTitle>
              <CardDescription>
                Add any specific instructions or context for the AI summary generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Focus on medication changes, emphasize follow-up importance, use simpler language for elderly patient..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Process Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Summary</CardTitle>
              <CardDescription>
                Convert discharge summary to patient-friendly language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGenerateSummary}
                disabled={!file}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <FileText className="h-5 w-5 mr-2" />
                Generate Summary
              </Button>
              
              {!file && (
                <div className="flex items-start space-x-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>Please upload a PDF file first</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <span>AI analyzes the medical content</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <span>Converts to patient-friendly language</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <span>Review and send to patient</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewSummary;
