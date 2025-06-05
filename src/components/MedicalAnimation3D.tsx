
import React from 'react';
import { Stethoscope, FileText, Heart, Activity, Brain, Pill, Hospital, UserCheck } from 'lucide-react';

const MedicalAnimation3D = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large floating stethoscope */}
      <div className="absolute top-20 right-20 animate-float-slow perspective-1000">
        <div className="transform-style-preserve-3d rotate-x-12 rotate-y-12">
          <div className="w-24 h-24 bg-gradient-to-br from-turquoise/20 to-sky-blue/30 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center animate-rotate-y">
            <Stethoscope className="w-12 h-12 text-turquoise" />
          </div>
        </div>
      </div>

      {/* Medical report card */}
      <div className="absolute top-40 left-16 animate-float-delayed perspective-1000">
        <div className="transform-style-preserve-3d rotate-x-6 -rotate-y-6">
          <div className="w-32 h-40 bg-gradient-to-br from-white/80 to-sky-blue/10 rounded-xl backdrop-blur-md border border-white/30 p-4 animate-tilt shadow-2xl">
            <FileText className="w-6 h-6 text-turquoise mb-2" />
            <div className="space-y-1">
              <div className="h-2 bg-turquoise/30 rounded w-full"></div>
              <div className="h-2 bg-sky-blue/20 rounded w-3/4"></div>
              <div className="h-2 bg-lavender/30 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Heart monitor */}
      <div className="absolute bottom-32 right-32 animate-pulse-gentle perspective-1000">
        <div className="transform-style-preserve-3d rotate-x-8 rotate-y-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center animate-bounce-slow">
            <Heart className="w-10 h-10 text-red-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Brain scan */}
      <div className="absolute top-60 right-60 animate-float perspective-1000">
        <div className="transform-style-preserve-3d -rotate-x-4 rotate-y-15">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-lavender/30 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center animate-spin-slow">
            <Brain className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Activity monitor */}
      <div className="absolute bottom-60 left-32 animate-float-slow perspective-1000">
        <div className="transform-style-preserve-3d rotate-x-10 -rotate-y-5">
          <div className="w-24 h-16 bg-gradient-to-br from-green-400/20 to-turquoise/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Activity className="w-8 h-8 text-green-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Pill bottle */}
      <div className="absolute top-96 left-60 animate-float-delayed perspective-1000">
        <div className="transform-style-preserve-3d rotate-x-6 rotate-y-12">
          <div className="w-14 h-20 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center animate-wobble">
            <Pill className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Hospital building */}
      <div className="absolute bottom-40 left-60 animate-float perspective-1000">
        <div className="transform-style-preserve-3d -rotate-x-3 -rotate-y-8">
          <div className="w-18 h-18 bg-gradient-to-br from-blue-400/20 to-sky-blue/30 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center animate-sway">
            <Hospital className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Patient check */}
      <div className="absolute top-80 right-40 animate-float-slow perspective-1000">
        <div className="transform-style-preserve-3d rotate-x-5 rotate-y-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center animate-bounce-gentle">
            <UserCheck className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-turquoise/20 rounded-full animate-float-particle-${i % 3}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-blue/5 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-turquoise/3 to-transparent"></div>
    </div>
  );
};

export default MedicalAnimation3D;
