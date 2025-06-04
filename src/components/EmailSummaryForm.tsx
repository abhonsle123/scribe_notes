
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, CheckCircle } from "lucide-react";

interface EmailSummaryFormProps {
  summaryId: string;
  patientName: string;
  summaryContent: string;
  onEmailSent: () => void;
}

export const EmailSummaryForm = ({ 
  summaryId, 
  patientName, 
  summaryContent, 
  onEmailSent 
}: EmailSummaryFormProps) => {
  const [patientEmail, setPatientEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!patientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter the patient's email address.",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      console.log('Sending email for summary:', summaryId);

      const { data, error } = await supabase.functions.invoke('send-summary-email', {
        body: {
          summaryId,
          patientEmail,
          patientName,
          summaryContent
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      console.log('Email sent successfully:', data);

      setEmailSent(true);
      onEmailSent();

      toast({
        title: "Email Sent Successfully",
        description: `Medical summary has been sent to ${patientEmail}`,
      });

    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast({
        title: "Failed to Send Email",
        description: error.message || "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Email Sent Successfully</h3>
              <p className="text-green-700">Summary has been delivered to {patientEmail}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Send Summary via Email
        </CardTitle>
        <CardDescription>
          Enter the patient's email address to send them their medical summary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="patient-email">Patient Email Address</Label>
          <Input
            id="patient-email"
            type="email"
            placeholder="patient@example.com"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            disabled={isSending}
          />
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={handleSendEmail}
            disabled={isSending || !patientEmail}
            className="bg-blue-600 hover:bg-blue-700 flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
