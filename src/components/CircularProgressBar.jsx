import React from 'react';

const CircularProgressBar = ({ progress, size = 120, strokeWidth = 10, circleColor = "text-slate-200 dark:text-slate-700", progressColor = "text-violet-600" }) => {
    const radius = size / 2 - strokeWidth;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                className="transform -rotate-90 w-full h-full"
                width={size}
                height={size}
            >
                {/* Background Circle */}
                <circle
                    className={circleColor}
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <circle
                    className={`${progressColor} transition-all duration-1000 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-slate-700 dark:text-slate-200">
                <span className="text-2xl font-bold">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};

export default CircularProgressBar;
