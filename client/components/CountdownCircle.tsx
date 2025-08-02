import React, { useState, useEffect } from 'react';

const CountdownCircle = ({ duration = 300, onComplete }) => {
  // duration in seconds
  const [timeLeft, setTimeLeft] = useState(duration);

  // SVG circle settings
  const radius = 70;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Update stroke offset based on remaining time
  const strokeOffset = circumference - (timeLeft / duration) * circumference;

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete && onComplete();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = sec => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="relative w-40 h-40">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Animated progress circle */}
        <circle
          stroke="#3b82f6"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {/* Centered time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-semibold">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
};

export default CountdownCircle;
