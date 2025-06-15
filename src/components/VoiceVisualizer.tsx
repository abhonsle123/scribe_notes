
import React from 'react';

interface VoiceVisualizerProps {
  volume: number; // A value between 0 and 1
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ volume }) => {
  const scale = 1 + volume * 1.5;
  const blur = 10 + volume * 20;
  const opacity = 0.5 + volume * 0.5;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute w-full h-full rounded-full bg-blue-400 transition-all duration-200 ease-out"
        style={{
          transform: `scale(${scale * 1.2})`,
          filter: `blur(${blur * 2}px)`,
          opacity: opacity * 0.3,
        }}
      />
      {/* Main orb */}
      <div
        className="absolute w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 transition-all duration-200 ease-out"
        style={{
          transform: `scale(${scale})`,
          filter: `blur(${blur}px)`,
          opacity: opacity,
        }}
      />
      {/* Inner core */}
      <div
        className="absolute w-3/4 h-3/4 rounded-full bg-white transition-all duration-200 ease-out"
        style={{
          transform: `scale(${scale * 0.9})`,
          filter: `blur(${blur * 0.5}px)`,
          opacity: opacity * 0.5,
        }}
      />
    </div>
  );
};

export default VoiceVisualizer;
