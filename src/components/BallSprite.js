import React from "react";

export default function BallSprite() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="50"
      viewBox="0 0 50 50"
      version="1.1"
      xmlSpace="preserve"
    >
      <g>
        {/* Main ball circle */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="#FF6B35"
          stroke="#E55A2B"
          strokeWidth="2"
        />
        
        {/* Ball highlight */}
        <circle
          cx="20"
          cy="20"
          r="8"
          fill="#FF8A65"
          stroke="none"
        />
        
        {/* Ball shadow */}
        <circle
          cx="30"
          cy="30"
          r="6"
          fill="#D84315"
          stroke="none"
        />
        
        {/* Ball texture lines */}
        <path
          d="M 15 15 Q 25 25 35 35"
          stroke="#E55A2B"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 35 15 Q 25 25 15 35"
          stroke="#E55A2B"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
} 