
import { FileAudio } from "lucide-react";

export const LoadingView = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mx-auto mb-6 animate-pulse-gentle flex items-center justify-center">
          <FileAudio className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Loading Transcriptions
        </h1>
        <p className="text-gray-600">Retrieving your recent audio transcriptions...</p>
      </div>
    </div>
  );
};
