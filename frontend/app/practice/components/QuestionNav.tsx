'use client';

import { useState } from 'react';

interface QuestionNavProps {
  passageTitle: string;
  startNum: number;
  endNum: number;
  userAnswers: (number | string)[];
  isFinished?: boolean;
  correctAnswers?: { [key: number]: number | string };
}

export default function QuestionNav({
  passageTitle,
  startNum,
  endNum,
  userAnswers,
  isFinished = false,
  correctAnswers = {}
}: QuestionNavProps) {
  const [hoveredNum, setHoveredNum] = useState<number | null>(null);

  const isCorrect = (num: number) => {
    if (!isFinished) return true;
    const userAnswer = userAnswers[num - 1];
    const correctAnswer = correctAnswers[num];
    return userAnswer === correctAnswer;
  };

  const isAnswered = (num: number) => {
    return userAnswers[num - 1] !== undefined;
  };

  return (
    <div className="flex items-center space-x-0.5 overflow-x-auto pb-1">
      {/* Question Numbers */}
      {Array.from({ length: endNum - startNum + 1 }, (_, i) => {
        const num = startNum + i;
        const hovered = hoveredNum === num;
        const answered = isAnswered(num);
        const correct = isCorrect(num);

        return (
          <div 
            key={num}
            className="flex flex-col items-center min-w-[24px] cursor-pointer"
            onMouseEnter={() => setHoveredNum(num)}
            onMouseLeave={() => setHoveredNum(null)}
          >
            {/* Top Line */}
            <div 
              className={`w-5 h-[2px] mb-1 transition-colors ${
                hovered 
                  ? 'bg-blue-500' 
                  : isFinished && answered && !correct 
                    ? 'bg-red-500' 
                    : 'bg-gray-300'
              }`}
            />
            
            {/* Number */}
            <span 
              className={`text-sm font-medium transition-colors ${
                hovered 
                  ? 'text-blue-500' 
                  : isFinished && answered && !correct 
                    ? 'text-red-500' 
                    : answered 
                      ? 'text-gray-800' 
                      : 'text-gray-400'
              }`}
            >
              {num}
            </span>
          </div>
        );
      })}
    </div>
  );
}
