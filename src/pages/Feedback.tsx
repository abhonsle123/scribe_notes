
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star, Heart, CheckCircle, Smile, Meh, Frown } from "lucide-react";

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const summaryId = searchParams.get('summary');
  
  const [ratings, setRatings] = useState({
    overall: 0,
    clarity: 0,
    usefulness: 0,
    accuracy: 0,
    recommendation: 0
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
    label 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
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
    </div>
  );

  const EmojiRating = ({ 
    rating, 
    onRatingChange, 
    label 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
    label: string;
  }) => {
    const emojis = [
      { icon: Frown, color: "text-red-500", bg: "bg-red-50", label: "Poor" },
      { icon: Frown, color: "text-orange-500", bg: "bg-orange-50", label: "Fair" },
      { icon: Meh, color: "text-yellow-500", bg: "bg-yellow-50", label: "Good" },
      { icon: Smile, color: "text-green-500", bg: "bg-green-50", label: "Very Good" },
      { icon: Smile, color: "text-blue-500", bg: "bg-blue-50", label: "Excellent" }
    ];

    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex justify-between space-x-2">
          {emojis.map((emoji, index) => {
            const IconComponent = emoji.icon;
            const ratingValue = index + 1;
            const isSelected = rating === ratingValue;
            
            return (
              <button
                key={ratingValue}
                type="button"
                onClick={() => onRatingChange(ratingValue)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `${emoji.bg} border-current ${emoji.color} shadow-md scale-105`
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <IconComponent className={`h-6 w-6 ${isSelected ? emoji.color : "text-gray-400"}`} />
                <span className={`text-xs mt-1 ${isSelected ? emoji.color : "text-gray-500"}`}>
                  {emoji.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

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

    // Check if at least one rating is provided
    const hasRating = Object.values(ratings).some(rating => rating > 0);
    if (!hasRating && !openFeedback.trim()) {
      toast({
        title: "Please Provide Feedback",
        description: "Please provide at least one rating or written feedback.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          session_id: sessionId,
          summary_id: summaryId,
          overall_rating: ratings.overall || null,
          clarity_rating: ratings.clarity || null,
          usefulness_rating: ratings.usefulness || null,
          accuracy_rating: ratings.accuracy || null,
          recommendation_rating: ratings.recommendation || null,
          open_feedback: openFeedback.trim() || null
        });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
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
              Please rate different aspects of your medical summary experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Overall Experience */}
              <StarRating
                rating={ratings.overall}
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, overall: rating }))}
                label="Overall, how would you rate your experience with Liaise?"
              />

              {/* Clarity */}
              <EmojiRating
                rating={ratings.clarity}
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, clarity: rating }))}
                label="How clear and easy to understand was your summary?"
              />

              {/* Usefulness */}
              <StarRating
                rating={ratings.usefulness}
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, usefulness: rating }))}
                label="How useful was the information provided?"
              />

              {/* Accuracy */}
              <EmojiRating
                rating={ratings.accuracy}
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, accuracy: rating }))}
                label="How accurate did the summary seem compared to your visit?"
              />

              {/* Recommendation */}
              <StarRating
                rating={ratings.recommendation}
                onRatingChange={(rating) => setRatings(prev => ({ ...prev, recommendation: rating }))}
                label="How likely are you to recommend Liaise to others?"
              />

              {/* Open feedback */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Additional Comments (Optional)
                </label>
                <Textarea
                  placeholder="Tell us more about your experience or suggest improvements..."
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
