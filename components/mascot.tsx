import React from "react";

export type MascotPose = "arrow" | "idle" | "flex" | "celebrate" | "thinking";

interface MascotProps {
  pose?: MascotPose;
  className?: string;
  size?: number;
}

export const Mascot: React.FC<MascotProps> = ({
  pose = "arrow",
  className = "",
  size = 280,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 300 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Soft Shadow under mascot */}
        <ellipse
          cx="150"
          cy="300"
          rx="80"
          ry="14"
          fill="#15121F"
          fillOpacity="0.15"
        />

        {pose === "arrow" && (
          <g id="pose-arrow">
            {/* Gold Coins Stack Base */}
            <g id="coin-stack">
              {/* Stack 1 - Left */}
              <ellipse cx="110" cy="275" rx="35" ry="12" fill="#C2980C" />
              <rect x="75" y="260" width="70" height="15" fill="#F6C61A" stroke="#15121F" strokeWidth="4" rx="4" />
              <ellipse cx="110" cy="260" rx="35" ry="10" fill="#FFE366" stroke="#15121F" strokeWidth="4" />
              
              <rect x="75" y="248" width="70" height="12" fill="#F6C61A" stroke="#15121F" strokeWidth="4" rx="4" />
              <ellipse cx="110" cy="248" rx="35" ry="10" fill="#FFE366" stroke="#15121F" strokeWidth="4" />

              {/* Stack 2 - Right */}
              <rect x="155" y="265" width="70" height="15" fill="#F6C61A" stroke="#15121F" strokeWidth="4" rx="4" />
              <ellipse cx="190" cy="265" rx="35" ry="10" fill="#FFE366" stroke="#15121F" strokeWidth="4" />

              <rect x="155" y="252" width="70" height="13" fill="#F6C61A" stroke="#15121F" strokeWidth="4" rx="4" />
              <ellipse cx="190" cy="252" rx="35" ry="10" fill="#FFE366" stroke="#15121F" strokeWidth="4" />
              
              <rect x="155" y="240" width="70" height="12" fill="#F6C61A" stroke="#15121F" strokeWidth="4" rx="4" />
              <ellipse cx="190" cy="240" rx="35" ry="10" fill="#FFE366" stroke="#15121F" strokeWidth="4" />
            </g>

            {/* Mascot Legs */}
            <path
              d="M 125 210 Q 120 235 115 250"
              stroke="#15121F"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 175 210 Q 180 230 185 240"
              stroke="#15121F"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Left Foot */}
            <ellipse cx="110" cy="252" rx="14" ry="7" fill="#15121F" />
            {/* Right Foot */}
            <ellipse cx="190" cy="242" rx="14" ry="7" fill="#15121F" />

            {/* Curved Violet Arrow held above head */}
            <g id="violet-arrow">
              <path
                d="M 65 75 C 110 25, 190 25, 235 60 L 245 42 L 255 85 L 210 82 L 225 68 C 185 38, 115 38, 75 80 Z"
                fill="#7C5CFA"
                stroke="#15121F"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <path
                d="M 80 70 C 120 40, 180 40, 220 70"
                stroke="#A892FF"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>

            {/* Mascot Hands holding the arrow */}
            <path
              d="M 105 130 Q 90 90 100 60"
              stroke="#15121F"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 195 130 Q 210 90 200 62"
              stroke="#15121F"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hand Mittens */}
            <circle cx="100" cy="56" r="10" fill="#15121F" />
            <circle cx="200" cy="58" r="10" fill="#15121F" />

            {/* Gold Coin Main Body */}
            <circle cx="150" cy="155" r="65" fill="#15121F" />
            <circle cx="150" cy="155" r="60" fill="#F6C61A" />
            <circle cx="150" cy="155" r="50" fill="#FFE366" />
            <circle cx="150" cy="155" r="48" fill="#F6C61A" />

            {/* Coin Inner Ridge Rim */}
            <circle cx="150" cy="155" r="42" stroke="#15121F" strokeWidth="3" strokeDasharray="6 4" fill="none" />

            {/* Big Expressive Eyes */}
            {/* Left Eye */}
            <ellipse cx="132" cy="142" rx="13" ry="18" fill="#FFFFFF" stroke="#15121F" strokeWidth="4" />
            <ellipse cx="134" cy="144" rx="7" ry="10" fill="#15121F" />
            <circle cx="136" cy="140" r="3" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="168" cy="142" rx="13" ry="18" fill="#FFFFFF" stroke="#15121F" strokeWidth="4" />
            <ellipse cx="166" cy="144" rx="7" ry="10" fill="#15121F" />
            <circle cx="168" cy="140" r="3" fill="#FFFFFF" />

            {/* Rosy Cheeks */}
            <ellipse cx="120" cy="158" rx="7" ry="4" fill="#FF8A8A" opacity="0.6" />
            <ellipse cx="180" cy="158" rx="7" ry="4" fill="#FF8A8A" opacity="0.6" />

            {/* Cute Open Smiling Mouth */}
            <path
              d="M 132 162 Q 150 182 168 162 Z"
              fill="#15121F"
              stroke="#15121F"
              strokeWidth="2"
            />
            <path
              d="M 140 172 Q 150 182 160 172 Z"
              fill="#FF5252"
            />
          </g>
        )}

        {(pose === "idle" || pose === "flex" || pose === "celebrate" || pose === "thinking") && (
          <g id="pose-generic">
            {/* Mascot Legs */}
            <path d="M 130 215 Q 125 245 120 260" stroke="#15121F" strokeWidth="12" strokeLinecap="round" />
            <path d="M 170 215 Q 175 245 180 260" stroke="#15121F" strokeWidth="12" strokeLinecap="round" />
            <ellipse cx="115" cy="265" rx="14" ry="7" fill="#15121F" />
            <ellipse cx="185" cy="265" rx="14" ry="7" fill="#15121F" />

            {/* Arms flexing or waving */}
            {pose === "flex" || pose === "idle" ? (
              <>
                <path d="M 95 150 Q 75 130 85 110" stroke="#15121F" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M 205 150 Q 225 130 215 110" stroke="#15121F" strokeWidth="12" strokeLinecap="round" fill="none" />
                <circle cx="85" cy="106" r="10" fill="#15121F" />
                <circle cx="215" cy="106" r="10" fill="#15121F" />
              </>
            ) : pose === "celebrate" ? (
              <>
                <path d="M 95 150 Q 70 110 80 80" stroke="#15121F" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M 205 150 Q 230 110 220 80" stroke="#15121F" strokeWidth="12" strokeLinecap="round" fill="none" />
                <circle cx="80" cy="75" r="10" fill="#15121F" />
                <circle cx="220" cy="75" r="10" fill="#15121F" />
              </>
            ) : (
              <>
                <path d="M 95 160 Q 80 180 110 175" stroke="#15121F" strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M 205 160 Q 220 180 190 175" stroke="#15121F" strokeWidth="10" strokeLinecap="round" fill="none" />
              </>
            )}

            {/* Main Body Coin */}
            <circle cx="150" cy="150" r="65" fill="#15121F" />
            <circle cx="150" cy="150" r="60" fill="#F6C61A" />
            <circle cx="150" cy="150" r="50" fill="#FFE366" />
            <circle cx="150" cy="150" r="48" fill="#F6C61A" />
            <circle cx="150" cy="150" r="42" stroke="#15121F" strokeWidth="3" strokeDasharray="6 4" fill="none" />

            {/* Eyes */}
            <ellipse cx="132" cy="138" rx="12" ry="16" fill="#FFFFFF" stroke="#15121F" strokeWidth="4" />
            <ellipse cx="134" cy="140" rx="6" ry="9" fill="#15121F" />
            <circle cx="136" cy="136" r="3" fill="#FFFFFF" />

            <ellipse cx="168" cy="138" rx="12" ry="16" fill="#FFFFFF" stroke="#15121F" strokeWidth="4" />
            <ellipse cx="166" cy="140" rx="6" ry="9" fill="#15121F" />
            <circle cx="168" cy="136" r="3" fill="#FFFFFF" />

            {/* Smile */}
            <path d="M 132 156 Q 150 176 168 156 Z" fill="#15121F" stroke="#15121F" strokeWidth="2" />
            <path d="M 140 166 Q 150 176 160 166 Z" fill="#FF5252" />
          </g>
        )}
      </svg>
    </div>
  );
};
