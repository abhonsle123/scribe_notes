
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export const NotAuthenticatedView = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 flex items-center justify-center">
      <Card className="glass-card border-0 shadow-xl text-center p-12 max-w-2xl mx-auto">
        <CardContent>
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <User className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Authentication Required
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Please log in to view your transcriptions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
