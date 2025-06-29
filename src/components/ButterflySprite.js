import React from "react";

export default function ButterflySprite() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="50"
      viewBox="0 0 60 50"
      version="1.1"
      xmlSpace="preserve"
    >
      <g>
        {/* Left wing */}
        <ellipse
          cx="20"
          cy="25"
          rx="15"
          ry="20"
          fill="#FF69B4"
          stroke="#FF1493"
          strokeWidth="1"
        />
        <ellipse
          cx="18"
          cy="23"
          rx="8"
          ry="12"
          fill="#FFB6C1"
          stroke="none"
        />
        
        {/* Right wing */}
        <ellipse
          cx="40"
          cy="25"
          rx="15"
          ry="20"
          fill="#FF69B4"
          stroke="#FF1493"
          strokeWidth="1"
        />
        <ellipse
          cx="42"
          cy="23"
          rx="8"
          ry="12"
          fill="#FFB6C1"
          stroke="none"
        />
        
        {/* Body */}
        <ellipse
          cx="30"
          cy="25"
          rx="2"
          ry="15"
          fill="#8B4513"
          stroke="#654321"
          strokeWidth="1"
        />
        
        {/* Head */}
        <circle
          cx="30"
          cy="12"
          r="4"
          fill="#8B4513"
          stroke="#654321"
          strokeWidth="1"
        />
        
        {/* Antennae */}
        <line
          x1="28"
          y1="10"
          x2="25"
          y2="5"
          stroke="#654321"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="32"
          y1="10"
          x2="35"
          y2="5"
          stroke="#654321"
          strokeWidth="1"
          strokeLinecap="round"
        />
        
        {/* Eyes */}
        <circle
          cx="28"
          cy="11"
          r="1"
          fill="#FFFFFF"
        />
        <circle
          cx="32"
          cy="11"
          r="1"
          fill="#FFFFFF"
        />
        <circle
          cx="28"
          cy="11"
          r="0.5"
          fill="#000000"
        />
        <circle
          cx="32"
          cy="11"
          r="0.5"
          fill="#000000"
        />
      </g>
    </svg>
  );
} 