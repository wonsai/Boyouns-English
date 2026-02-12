import React, { useState } from 'react';
import { StudyItem } from '../types';
import { Button } from '../components/Button';
import { CheckCircle, PenTool } from 'lucide-react';
import { Confetti } from '../components/Confetti';

interface PracticeWritingProps {
  sentence: StudyItem;
  onComplete: () => void;
}

export const PracticeWriting: React.FC<PracticeWritingProps> = ({ sentence, onComplete }) => {
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const checkAnswer = () => {
    // Normalize spaces and punctuation
    const cleanInput = input.trim().replace(/\s+/g, ' ').toLowerCase();
    const cleanTarget = sentence.english.trim().replace(/\s+/g, ' ').toLowerCase();
    
    // Strict punctuation check? For kids, maybe lenient on the final dot? 
    // Let's enforce the dot if it's in the sentence, to form good habits.
    // But let's be kind: if they miss the dot but get words right, maybe give a warning or just pass.
    // The requirement is "memorize and write", so let's stick to exact match mostly, but case insensitive.
    
    if (cleanInput === cleanTarget) {
      setIsCorrect(true);
      setShowConfetti(true);
    } else {
       // Check if only missing period
       if (cleanInput + '.' === cleanTarget) {
          alert("마침표(.)를 잊지 마세요!");
       } else {
          alert("아직 조금 달라요. 다시 해볼까요?");
       }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-8">
      {showConfetti && <Confetti />}
      
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-pink-500">단계 3: 전체 문장 쓰기</h3>
        <p className="text-xl text-gray-700 font-bold mb-4">{sentence.korean}</p>
        <p className="text-sm text-gray-400">영어 문장을 기억해서 적어보세요!</p>
      </div>

      <div className="w-full">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="여기에 문장을 쓰세요..."
          className="w-full p-6 text-2xl rounded-3xl border-4 border-pink-200 focus:border-pink-400 outline-none resize-none shadow-inner h-40 text-center text-gray-700 placeholder-gray-300 font-medium"
          disabled={isCorrect}
          spellCheck={false}
        />
      </div>

      {!isCorrect ? (
        <Button variant="accent" onClick={checkAnswer} className="w-full md:w-auto">
          <PenTool size={20} /> 확인하기
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
             <div className="flex items-center gap-2 text-3xl font-bold text-pink-500">
               <CheckCircle size={40} /> 완벽해요! (Perfect!)
             </div>
             <Button variant="primary" size="lg" onClick={onComplete}>
               이 문장 완료! (Finish)
             </Button>
          </div>
      )}
    </div>
  );
};