
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, CheckCircle, Heart, Loader2 } from "lucide-react";

interface EmailTranscriptionSummaryFormProps {
  transcriptionId: string;
  patientName: string;
  summaryContent: string;
  onEmailSent: () => void;
  originalFilename?: string;
}

export const EmailTranscriptionSummaryForm = ({ 
  transcriptionId, 
  patientName, 
  summaryContent, 
  onEmailSent,
  originalFilename,
}: EmailTranscriptionSummaryFormProps) => {
  const [patientEmail, setPatientEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendFollowUp, setSendFollowUp] = useState(true);
  const [followUpSent, setFollowUpSent] = useState(false);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated to perform this action.");
      }

      console.log('Creating summary record from transcription:', transcriptionId);
      const { data: newSummary, error: summaryError } = await supabase
        .from('summaries')
        .insert({
          summary_content: summaryContent,
          patient_name: patientName,
          user_id: user.id,
          original_filename: originalFilename || `From transcription ${transcriptionId}`,
          patient_email: patientEmail,
        })
        .select('id')
        .single();
      
      if (summaryError) {
        console.error('Error creating summary from transcription:', summaryError);
        throw new Error('Could not prepare summary for sending. ' + summaryError.message);
      }
      
      const newSummaryId = newSummary.id;
      console.log('Sending email for new summary:', newSummaryId);

      const { data, error } = await supabase.functions.invoke('send-summary-email', {
        body: {
          summaryId: newSummaryId,
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

      const { error: updateError } = await supabase
        .from('transcriptions')
        .update({
          patient_email: patientEmail,
          patient_summary_sent_at: new Date().toISOString()
        })
        .eq('id', transcriptionId);

      if (updateError) {
        console.error('Error updating transcription record:', updateError);
      }

      setEmailSent(true);
      onEmailSent();

      toast({
        title: "Email Sent Successfully",
        description: `Patient summary has been sent to ${patientEmail}`,
      });

      if (sendFollowUp) {
        try {
          console.log('Sending follow-up email...');
          
          const { data: followUpData, error: followUpError } = await supabase.functions.invoke('send-follow-up-email', {
            body: {
              summaryId: newSummaryId,
              patientEmail,
              patientName
            }
          });

          if (followUpError) {
            console.error('Error sending follow-up email:', followUpError);
            toast({
              title: "Follow-up Email Failed",
              description: "Summary was sent, but follow-up email failed.",
              variant: "destructive"
            });
          } else {
            console.log('Follow-up email sent successfully:', followUpData);
            setFollowUpSent(true);
            toast({
              title: "Follow-up Email Sent",
              description: "Patient will receive a feedback request email shortly.",
            });
          }
        } catch (followUpError) {
          console.error('Follow-up email error:', followUpError);
        }
      }

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

  const handleFollowUpChange = (checked: boolean | "indeterminate") => {
    setSendFollowUp(checked === true);
  };

  if (emailSent) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Email Sent Successfully</h3>
                <p className="text-green-700">Summary has been delivered to {patientEmail}</p>
              </div>
            </div>
            
            {sendFollowUp && (
              <div className="flex items-center space-x-3 pt-2 border-t border-green-200">
                <Heart className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">Follow-up Email</h4>
                  <p className="text-sm text-green-700">
                    {followUpSent 
                      ? "Feedback request email has been sent"
                      : "Will be sent to request patient feedback"
                    }
                  </p>
                </div>
              </div>
            )}
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
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="send-follow-up"
            checked={sendFollowUp}
            onCheckedChange={handleFollowUpChange}
            disabled={isSending}
          />
          <Label htmlFor="send-follow-up" className="text-sm">
            Send follow-up email asking for feedback (recommended)
          </Label>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={handleSendEmail}
            disabled={isSending || !patientEmail}
            className="bg-blue-600 hover:bg-blue-700 flex items-center"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
