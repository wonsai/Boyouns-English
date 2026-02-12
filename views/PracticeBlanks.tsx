import React, { useState, useEffect } from 'react';
import { StudyItem } from '../types';
import { Button } from '../components/Button';
import { CheckCircle } from 'lucide-react';
import { Confetti } from '../components/Confetti';

interface PracticeBlanksProps {
  sentence: StudyItem;
  onComplete: () => void;
}

export const PracticeBlanks: React.FC<PracticeBlanksProps> = ({ sentence, onComplete }) => {
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [blankIndices, setBlankIndices] = useState<number[]>([]);
  const words = sentence.english.split(' ');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Randomly select 2-3 words to blank out, but keep it deterministic for simplicity if needed.
    // Let's blank out ~50% of words.
    const indices: number[] = [];
    words.forEach((_, idx) => {
       // Always blank out nouns/verbs if possible, but random is fine for this level.
       if (Math.random() > 0.4) indices.push(idx);
    });
    // Ensure at least one blank
    if (indices.length === 0) indices.push(words.length - 1);
    
    setBlankIndices(indices);
    // Initialize inputs
    const initialInputs = new Array(words.length).fill('');
    setUserInputs(initialInputs);
    setIsCorrect(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const checkAnswer = () => {
    let allCorrect = true;
    blankIndices.forEach(idx => {
       if (userInputs[idx].trim().toLowerCase() !== words[idx].toLowerCase().replace(/[.,]/g, '')) {
         // Allow simple match ignoring punctuation for the typed word if the user didn't type it
         // But "words[idx]" includes punctuation like "kite."
         // Let's strip punctuation for comparison
         const cleanTarget = words[idx].replace(/[.,]/g, '');
         const cleanInput = userInputs[idx].trim().replace(/[.,]/g, '');
         if (cleanTarget.toLowerCase() !== cleanInput.toLowerCase()) {
            allCorrect = false;
         }
       }
    });

    if (allCorrect) {
      setIsCorrect(true);
      setShowConfetti(true);
    } else {
      alert("틀린 부분이 있어요. 다시 확인해보세요! (Check your spelling)");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-8">
      {showConfetti && <Confetti />}
      
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-yellow-600">단계 2: 빈칸 채우기</h3>
        <p className="text-gray-500">{sentence.korean}</p>
      </div>

      <div className="w-full bg-white rounded-3xl shadow-lg p-8 flex flex-wrap gap-3 items-center justify-center leading-loose">
        {words.map((word, idx) => {
          const isBlank = blankIndices.includes(idx);
          const cleanWord = word.replace(/[.,]/g, ''); // Simple word for width estimation
          
          if (!isBlank) {
            return <span key={idx} className="text-2xl font-medium text-gray-800">{word}</span>;
          }

          return (
            <input
              key={idx}
              type="text"
              value={userInputs[idx]}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              className="border-b-4 border-yellow-300 bg-yellow-50 text-center text-2xl font-bold text-green-700 outline-none focus:border-green-500 rounded px-2"
              style={{ width: `${Math.max(60, cleanWord.length * 15)}px` }}
              disabled={isCorrect}
              autoCapitalize="off"
            />
          );
        })}
      </div>

      {!isCorrect ? (
        <Button variant="secondary" onClick={checkAnswer}>
          정답 확인
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
             <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
               <CheckCircle size={32} /> 대단해요!
             </div>
             <Button variant="accent" size="lg" onClick={onComplete}>
               다음 단계 (Next Level)
             </Button>
          </div>
      )}
    </div>
  );
};