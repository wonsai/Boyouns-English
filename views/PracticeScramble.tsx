import React, { useState, useEffect } from 'react';
import { StudyItem } from '../types';
import { Button } from '../components/Button';
import { Shuffle, RotateCcw, CheckCircle } from 'lucide-react';
import { Confetti } from '../components/Confetti';

interface PracticeScrambleProps {
  sentence: StudyItem;
  onComplete: () => void;
}

export const PracticeScramble: React.FC<PracticeScrambleProps> = ({ sentence, onComplete }) => {
  // Remove punctuation for easier scrambling, keep it simple for kids
  // Or keep punctuation as separate blocks? Let's attach punctuation to the word for simplicity in this version.
  const originalWords = sentence.english.split(' ');
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence]);

  const resetGame = () => {
    const shuffled = [...originalWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setSelectedWords([]);
    setIsCorrect(false);
    setShowConfetti(false);
  };

  const handleWordClick = (word: string, index: number) => {
    // Remove from shuffled, add to selected
    const newShuffled = [...shuffledWords];
    newShuffled.splice(index, 1);
    setShuffledWords(newShuffled);
    setSelectedWords([...selectedWords, word]);
  };

  const handleSelectedWordClick = (word: string, index: number) => {
    // Remove from selected, return to shuffled
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setShuffledWords([...shuffledWords, word]);
  };

  const checkAnswer = () => {
    if (selectedWords.join(' ') === sentence.english) {
      setIsCorrect(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      alert("다시 한번 생각해볼까요? (Try again!)");
      resetGame();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-8">
      {showConfetti && <Confetti />}
      
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-green-600">단계 1: 문장 순서 맞추기</h3>
        <p className="text-gray-500">{sentence.korean}</p>
      </div>

      {/* Drop Zone */}
      <div className="w-full min-h-[120px] bg-white border-4 border-dashed border-green-300 rounded-2xl p-6 flex flex-wrap gap-3 items-center justify-center transition-colors hover:bg-green-50">
        {selectedWords.length === 0 && (
          <p className="text-gray-400 text-sm">단어를 순서대로 누르세요</p>
        )}
        {selectedWords.map((word, idx) => (
          <button
            key={`${word}-${idx}`}
            onClick={() => !isCorrect && handleSelectedWordClick(word, idx)}
            className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl shadow-md text-lg hover:bg-red-400 transition-colors animate-bounce-short"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Word Bank */}
      {!isCorrect && (
        <div className="flex flex-wrap gap-3 justify-center">
          {shuffledWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              onClick={() => handleWordClick(word, idx)}
              className="px-4 py-2 bg-white text-green-700 border-2 border-green-200 font-bold rounded-xl shadow-sm text-lg hover:bg-green-100 transform hover:-translate-y-1 transition-all"
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4">
        {!isCorrect ? (
          <>
            <Button variant="outline" onClick={resetGame}>
              <RotateCcw size={20} /> 다시하기
            </Button>
            {shuffledWords.length === 0 && (
              <Button variant="primary" onClick={checkAnswer}>
                정답 확인
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
             <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
               <CheckCircle size={32} /> 참 잘했어요!
             </div>
             <Button variant="accent" size="lg" onClick={onComplete}>
               다음 단계 (Next Level)
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};