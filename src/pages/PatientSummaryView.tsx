import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SummaryChatbox } from "@/components/SummaryChatbox";
import { FileText, Heart, Shield } from "lucide-react";

interface PatientSummary {
  id: string;
  patient_name: string;
  summary_content: string;
  created_at: string;
  chat_history: { role: 'user' | 'assistant'; content: string }[] | null;
  patient_email: string | null;
}

const PatientSummaryView = () => {
  const [searchParams] = useSearchParams();
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const summaryId = searchParams.get('id');
  const patientEmail = searchParams.get('email');

  useEffect(() => {
    if (summaryId && patientEmail) {
      fetchSummary();
    } else {
      console.log('Missing parameters - summaryId:', summaryId, 'patientEmail:', patientEmail);
      setError('Invalid access link. Please check your email for the correct link.');
      setLoading(false);
    }
  }, [summaryId, patientEmail]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      console.log('Fetching summary with ID:', summaryId, 'for email:', patientEmail);
      console.log('URL parameters check - ID exists:', !!summaryId, 'Email exists:', !!patientEmail);
      
      // First, try to fetch the summary by ID only
      console.log('Attempting to fetch from summaries table...');
      const { data, error } = await supabase
        .from('summaries')
        .select('id, patient_name, summary_content, created_at, chat_history, patient_email')
        .eq('id', summaryId)
        .maybeSingle();

      console.log('Supabase query result:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- Data exists:', !!data);

      if (error) {
        console.error('Supabase error details:', error);
        setError('Unable to load your summary. Please check your link or contact your healthcare provider.');
        return;
      }

      if (!data) {
        console.log('No summary found for ID:', summaryId);
        console.log('This could mean:');
        console.log('1. The summary ID does not exist in the database');
        console.log('2. There is a database connection issue');
        console.log('3. The summary has been deleted');
        setError('Summary not found. This link may have expired or is invalid.');
        return;
      }

      console.log('Summary found in database:', {
        id: data.id,
        patient_name: data.patient_name,
        has_content: !!data.summary_content,
        patient_email_in_db: data.patient_email,
        url_email: patientEmail
      });

      // Validate email access - check if the summary has a patient_email set
      if (data.patient_email) {
        // If patient_email is set in the database, it must match the URL parameter
        if (data.patient_email !== patientEmail) {
          console.log('Email mismatch - database:', data.patient_email, 'URL:', patientEmail);
          setError('Access denied. This summary is not associated with the provided email address.');
          return;
        }
        console.log('Email validation passed - database email matches URL email');
      } else {
        // If patient_email is null in database, we still validate against the URL parameter
        // This ensures only users with the correct link can access the summary
        console.log('Summary found but no patient_email set in database. URL email:', patientEmail);
        
        // Update the database record with the patient email from the URL for future reference
        console.log('Attempting to update summary with patient email...');
        const { error: updateError } = await supabase
          .from('summaries')
          .update({ patient_email: patientEmail })
          .eq('id', summaryId);
        
        if (updateError) {
          console.error('Error updating patient email:', updateError);
          // Don't fail the request if updating fails, just log it
        } else {
          console.log('Successfully updated summary with patient email');
        }
      }

      console.log('All validation passed, setting summary data');
      setSummary(data as PatientSummary);
    } catch (error) {
      console.error('Unexpected error in fetchSummary:', error);
      setError('Unable to load your summary. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-turquoise to-sky-blue rounded-2xl mx-auto mb-6 animate-pulse-gentle flex items-center justify-center">
            <FileText className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Loading Your Summary
          </h1>
          <p className="text-gray-600">Please wait while we retrieve your medical summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            If you continue to have issues, please contact your healthcare provider.
          </p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-6 py-8 space-y-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-turquoise to-sky-blue rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Your Medical Summary
          </h1>
          <p className="text-xl text-gray-600">Hello {summary.patient_name}!</p>
          <p className="text-gray-500 mt-2">
            Generated on {new Date(summary.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Summary Content */}
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-turquoise/5 to-sky-blue/5 rounded-t-xl">
            <CardTitle className="flex items-center text-2xl">
              <div className="p-2 bg-gradient-to-br from-turquoise/10 to-sky-blue/10 rounded-xl mr-3">
                <FileText className="h-6 w-6 text-turquoise" />
              </div>
              Your Visit Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-8 rounded-2xl border border-gray-100">
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-800 leading-relaxed text-lg">
                  {summary.summary_content}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chatbox */}
        <SummaryChatbox
          summaryId={summary.id}
          summaryContent={summary.summary_content}
          initialChatHistory={summary.chat_history}
          isPublic={true}
        />

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600 mb-2">
            If you have any questions about this summary, please contact your healthcare provider.
          </p>
          <p className="text-sm text-gray-500">
            This summary was securely generated by Liaise Health
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientSummaryView;
