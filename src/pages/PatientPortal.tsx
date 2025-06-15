
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { SummaryChatbox } from "@/components/SummaryChatbox";
import { FileText, Heart, Shield } from "lucide-react";

interface PatientSummary {
  id: string;
  patient_name: string;
  summary_content: string;
  created_at: string;
  chat_history: { role: 'user' | 'assistant'; content: string }[] | null;
}

const PatientPortal = () => {
  const { summaryId, token } = useParams<{ summaryId: string; token: string }>();
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (summaryId && token) {
      fetchSummaryWithToken();
    } else {
      setError("Invalid access link. The URL is missing required information.");
      setLoading(false);
    }
  }, [summaryId, token]);

  const fetchSummaryWithToken = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-summary-by-token', {
        body: { summaryId, token },
      });

      if (error) {
        // The edge function will return a descriptive error message
        throw new Error(data.error || 'Failed to verify access.');
      }

      setSummary(data as PatientSummary);
    } catch (err: any) {
      console.error("Error fetching summary:", err);
      setError(err.message || "Unable to load your summary. This link may be invalid or expired.");
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
          <p className="text-gray-600">Please wait while we securely retrieve your medical summary...</p>
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
      <div className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
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

          <SummaryChatbox
            summaryId={summary.id}
            summaryContent={summary.summary_content}
            initialChatHistory={summary.chat_history}
            isPublic={true}
          />
        </div>

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

export default PatientPortal;
