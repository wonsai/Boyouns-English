import React, { useState, useEffect } from 'react';
import { StudyItem } from '../types';
import { Button } from '../components/Button';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { Confetti } from '../components/Confetti';
import { generateSentenceAudio, playAudioFromBase64 } from '../services/geminiService';

interface WordQuizProps {
  item: StudyItem;
  allItems: StudyItem[];
  mode: 'eng-to-kor' | 'kor-to-eng';
  onComplete: () => void;
}

export const WordQuiz: React.FC<WordQuizProps> = ({ item, allItems, mode, onComplete }) => {
  const [options, setOptions] = useState<StudyItem[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Play audio automatically if Eng->Kor mode
    if (mode === 'eng-to-kor') {
        generateSentenceAudio(item.english).then(base64 => {
            if(base64) playAudioFromBase64(base64);
        });
    }

    // Generate random options
    const otherItems = allItems.filter(i => i.id !== item.id);
    const shuffledOthers = [...otherItems].sort(() => Math.random() - 0.5).slice(0, 3);
    const quizOptions = [...shuffledOthers, item].sort(() => Math.random() - 0.5);
    setOptions(quizOptions);
    setSelectedOptionId(null);
    setIsCorrect(false);
    setShowConfetti(false);
  }, [item, allItems, mode]);

  const handleSelect = (optionId: number) => {
    if (isCorrect) return;
    
    setSelectedOptionId(optionId);
    if (optionId === item.id) {
      setIsCorrect(true);
      setShowConfetti(true);
      // Play audio for reinforcement even in Kor->Eng mode
      generateSentenceAudio(item.english).then(base64 => {
        if(base64) playAudioFromBase64(base64);
      });
    } else {
        // Simple shake effect or alert could be added here
    }
  };

  const questionText = mode === 'eng-to-kor' ? item.english : item.korean;
  const questionLabel = mode === 'eng-to-kor' ? "이 단어의 뜻은 무엇일까요?" : "이 뜻을 가진 영어 단어는?";

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-8 animate-fade-in">
      {showConfetti && <Confetti />}

      <div className="text-center space-y-4">
        <span className="px-4 py-1 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
            {mode === 'eng-to-kor' ? 'Step 1: 단어 뜻 맞추기' : 'Step 2: 영단어 맞추기'}
        </span>
        <h3 className="text-xl text-gray-500">{questionLabel}</h3>
        <div className="p-8 bg-white rounded-3xl shadow-lg border-4 border-blue-100 min-w-[280px]">
            <p className="text-4xl md:text-5xl font-black text-gray-800 tracking-wide">
                {questionText}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isAnswer = option.id === item.id;
            
            let btnClass = "bg-white hover:bg-gray-50 border-gray-200 text-gray-700";
            if (isSelected) {
                if (isAnswer) btnClass = "bg-green-500 text-white border-green-600 ring-4 ring-green-200";
                else btnClass = "bg-red-400 text-white border-red-500";
            } else if (isCorrect && isAnswer) {
                // Reveal answer if user got it right (or if we wanted to show correct answer on fail, but let's keep it retry based)
                btnClass = "bg-green-500 text-white border-green-600 opacity-50"; 
            }

            return (
                <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`p-6 rounded-2xl text-xl font-bold border-b-4 transition-all transform active:scale-95 shadow-sm ${btnClass}`}
                >
                    {mode === 'eng-to-kor' ? option.korean : option.english}
                </button>
            );
        })}
      </div>

      {isCorrect && (
        <div className="animate-fade-in pt-4">
             <Button variant="primary" size="lg" onClick={onComplete}>
               다음 문제! <CheckCircle className="ml-2" />
             </Button>
        </div>
      )}
    </div>
  );
};
