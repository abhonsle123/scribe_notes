import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star, Heart, CheckCircle, Frown } from "lucide-react";

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const summaryId = searchParams.get('summary');
  
  const [responses, setResponses] = useState({
    usedChatbox: null as boolean | null,
    chatboxExperience: 0,
    readabilityRating: 0,
    usefulnessRating: 0,
    accuracyRating: 0,
    overallSatisfaction: 0
  });
  
  const [openFeedback, setOpenFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: "Invalid Feedback Link",
        description: "This feedback link appears to be invalid. Please check the link from your email.",
        variant: "destructive"
      });
    }
  }, [sessionId, toast]);

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    label,
    maxRating = 5
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
    label: string;
    maxRating?: number;
  }) => (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500 flex justify-between">
        <span>1 = {maxRating === 10 ? 'Very dissatisfied' : maxRating === 5 && label.includes('experience') ? 'Very poor' : maxRating === 5 && label.includes('easy') ? 'Very difficult' : maxRating === 5 && label.includes('useful') ? 'Not useful at all' : 'Not accurate at all'}</span>
        <span>{maxRating} = {maxRating === 10 ? 'Very satisfied' : maxRating === 5 && label.includes('experience') ? 'Excellent' : maxRating === 5 && label.includes('easy') ? 'Very easy' : maxRating === 5 && label.includes('useful') ? 'Extremely useful' : 'Very accurate'}</span>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId) {
      toast({
        title: "Cannot Submit Feedback",
        description: "Invalid session. Please use the link from your email.",
        variant: "destructive"
      });
      return;
    }

    // Check if at least some feedback is provided
    const hasResponses = responses.usedChatbox !== null || 
                        responses.readabilityRating > 0 || 
                        responses.usefulnessRating > 0 || 
                        responses.accuracyRating > 0 || 
                        responses.overallSatisfaction > 0 || 
                        openFeedback.trim();
    
    if (!hasResponses) {
      toast({
        title: "Please Provide Feedback",
        description: "Please answer at least one question or provide written feedback.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the feedback data with proper null handling
      const feedbackData = {
        session_id: sessionId,
        summary_id: summaryId && summaryId !== 'null' ? summaryId : null,
        overall_rating: responses.overallSatisfaction > 0 ? responses.overallSatisfaction : null,
        clarity_rating: responses.readabilityRating > 0 ? responses.readabilityRating : null,
        usefulness_rating: responses.usefulnessRating > 0 ? responses.usefulnessRating : null,
        accuracy_rating: responses.accuracyRating > 0 ? responses.accuracyRating : null,
        recommendation_rating: responses.chatboxExperience > 0 ? responses.chatboxExperience : null,
        open_feedback: openFeedback.trim() || null,
        user_id: null // Explicitly set to null for anonymous feedback
      };

      console.log('Submitting feedback data:', feedbackData);

      // First, let's test if we can connect to the database
      const { data: testData, error: testError } = await supabase
        .from('feedback')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Database connection test failed:', testError);
        throw new Error('Database connection failed');
      }

      console.log('Database connection test successful');

      // Now try to insert the feedback
      const { data, error } = await supabase
        .from('feedback')
        .insert(feedbackData)
        .select();

      if (error) {
        console.error('Supabase insertion error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Feedback inserted successfully:', data);

      setIsSubmitted(true);
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // Provide more specific error messages
      let errorMessage = "There was an error submitting your feedback. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          errorMessage = "Permission denied. Please check if the feedback system is properly configured.";
        } else if (error.message.includes('connection')) {
          errorMessage = "Database connection failed. Please check your internet connection and try again.";
        } else if (error.message.includes('validation')) {
          errorMessage = "Invalid data provided. Please check your responses and try again.";
        }
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Frown className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Invalid Feedback Link</h2>
            <p className="text-gray-600">
              This feedback link appears to be invalid. Please check the link from your email or contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-green-500 mb-6">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your feedback has been received and will help us improve Liaise for all patients. We truly appreciate you taking the time to share your experience.
            </p>
            <div className="flex items-center justify-center text-red-500">
              <Heart className="h-5 w-5 mr-2" />
              <span className="text-sm">Made with care by the Liaise team</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">We Value Your Feedback</h1>
          <p className="text-gray-600">
            Help us improve Liaise by sharing your experience with our AI-generated medical summary
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Rate Your Experience
            </CardTitle>
            <CardDescription>
              Please answer the following questions about your Liaise experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Chatbox Usage */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Did you use the AI chatbox to ask questions or get clarification?
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setResponses(prev => ({ ...prev, usedChatbox: true }))}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      responses.usedChatbox === true
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setResponses(prev => ({ ...prev, usedChatbox: false, chatboxExperience: 0 }))}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      responses.usedChatbox === false
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Chatbox Experience Rating - only show if they used it */}
              {responses.usedChatbox === true && (
                <StarRating
                  rating={responses.chatboxExperience}
                  onRatingChange={(rating) => setResponses(prev => ({ ...prev, chatboxExperience: rating }))}
                  label="If yes, how would you rate your experience with it?"
                  maxRating={5}
                />
              )}

              {/* Readability */}
              <StarRating
                rating={responses.readabilityRating}
                onRatingChange={(rating) => setResponses(prev => ({ ...prev, readabilityRating: rating }))}
                label="How easy was it to read and understand your AI-generated summary?"
                maxRating={5}
              />

              {/* Usefulness */}
              <StarRating
                rating={responses.usefulnessRating}
                onRatingChange={(rating) => setResponses(prev => ({ ...prev, usefulnessRating: rating }))}
                label="How useful was the information provided in your summary?"
                maxRating={5}
              />

              {/* Accuracy */}
              <StarRating
                rating={responses.accuracyRating}
                onRatingChange={(rating) => setResponses(prev => ({ ...prev, accuracyRating: rating }))}
                label="How accurate did the summary feel when compared to your actual medical visit?"
                maxRating={5}
              />

              {/* Overall Satisfaction */}
              <StarRating
                rating={responses.overallSatisfaction}
                onRatingChange={(rating) => setResponses(prev => ({ ...prev, overallSatisfaction: rating }))}
                label="How satisfied are you overall with your Liaise experience?"
                maxRating={10}
              />

              {/* Additional Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Additional Comments (Optional)
                </label>
                <Textarea
                  placeholder="Share any additional thoughts or suggestions..."
                  value={openFeedback}
                  onChange={(e) => setOpenFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          Your feedback is anonymous and helps us improve our service for all patients.
        </div>
      </div>
    </div>
  );
};

export default Feedback;
