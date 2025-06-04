
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StarRating } from '@/components/StarRating';
import { Heart, MessageCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const sessionId = searchParams.get('session');
  const summaryId = searchParams.get('summary');
  
  const [ratings, setRatings] = useState({
    overall: 0,
    clarity: 0,
    usefulness: 0,
    accuracy: 0,
    recommendation: 0
  });
  
  const [openFeedback, setOpenFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: "Invalid Link",
        description: "This feedback link appears to be invalid.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [sessionId, navigate, toast]);

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    
    // Validate that at least overall rating is provided
    if (ratings.overall === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide at least an overall rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-feedback', {
        body: {
          sessionId,
          summaryId,
          ratings,
          openFeedback: openFeedback.trim() || null
        }
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
      });

    } catch (error: any) {
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your feedback helps us improve Liaise for everyone. We truly appreciate you taking the time to share your experience.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
              >
                Return to Liaise
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsSubmitted(false)}
                className="w-full"
              >
                Submit More Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">We Value Your Feedback</h1>
          <p className="text-gray-600">
            Help us improve Liaise by sharing your experience with our AI-generated medical summary
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span>Quick Feedback Survey</span>
            </CardTitle>
            <CardDescription>
              This will only take 2-3 minutes. Your responses help us create better healthcare communication tools.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Overall Rating */}
            <StarRating
              label="Overall Experience"
              description="How would you rate your overall experience with Liaise?"
              value={ratings.overall}
              onChange={(value) => handleRatingChange('overall', value)}
            />

            {/* Clarity Rating */}
            <StarRating
              label="Clarity of Summary"
              description="How clear and easy to understand was your medical summary?"
              value={ratings.clarity}
              onChange={(value) => handleRatingChange('clarity', value)}
            />

            {/* Usefulness Rating */}
            <StarRating
              label="Usefulness"
              description="How useful was the patient-friendly format for understanding your medical information?"
              value={ratings.usefulness}
              onChange={(value) => handleRatingChange('usefulness', value)}
            />

            {/* Accuracy Rating */}
            <StarRating
              label="Accuracy"
              description="How accurate did the summary appear compared to your original medical document?"
              value={ratings.accuracy}
              onChange={(value) => handleRatingChange('accuracy', value)}
            />

            {/* Recommendation Rating */}
            <StarRating
              label="Recommendation"
              description="How likely are you to recommend Liaise to others?"
              value={ratings.recommendation}
              onChange={(value) => handleRatingChange('recommendation', value)}
            />

            {/* Open Feedback */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Comments (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Share any additional thoughts, suggestions, or specific feedback about your experience.
              </p>
              <Textarea
                placeholder="Your feedback helps us improve..."
                value={openFeedback}
                onChange={(e) => setOpenFeedback(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 text-right">
                {openFeedback.length}/1000 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Skip for Now</span>
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || ratings.overall === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;
