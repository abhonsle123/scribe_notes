
import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  label: string;
  description?: string;
}

export const StarRating = ({ value, onChange, label, description }: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Very Poor";
      case 2: return "Poor";
      case 3: return "Average";
      case 4: return "Good";
      case 5: return "Excellent";
      default: return "";
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mb-2">{description}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => onChange(star)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || value)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        
        {(hoverRating || value) > 0 && (
          <span className="text-sm font-medium text-gray-600 ml-3">
            {getRatingText(hoverRating || value)}
          </span>
        )}
      </div>
    </div>
  );
};
