import React, { useState } from 'react';
import { LESSONS } from './constants';
import { Lesson } from './types';
import { StudyRoom } from './views/StudyRoom';
import { PracticeScramble } from './views/PracticeScramble';
import { PracticeBlanks } from './views/PracticeBlanks';
import { PracticeHandwriting } from './views/PracticeHandwriting';
import { WordQuiz } from './views/WordQuiz';
import { Star, Home, Trophy, BookOpen, Calendar } from 'lucide-react';
import { Confetti } from './components/Confetti';

const App: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // For Sentences (Lesson Type 1)
  const [selectedSentenceId, setSelectedSentenceId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0); 
  const [completedItems, setCompletedItems] = useState<number[]>([]);

  // For Words (Lesson Type 2)
  // Flow: Eng->Kor (All items) -> Kor->Eng (All items) -> Writing (All items)
  // We track "Word Phase": 0 (Eng->Kor), 1 (Kor->Eng), 2 (Writing)
  const [wordPhase, setWordPhase] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCompletedItems([]);
    setSelectedSentenceId(null);
    setCurrentStep(0);
    setWordPhase(0);
    setCurrentWordIndex(0);
  };

  const handleHome = () => {
    setSelectedLesson(null);
  };

  // --- Logic for Sentences (Feb 10) ---
  const handleSelectSentence = (id: number) => {
    setSelectedSentenceId(id);
    setCurrentStep(0);
  };

  const handleNextSentenceStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      if (selectedSentenceId && !completedItems.includes(selectedSentenceId)) {
        setCompletedItems([...completedItems, selectedSentenceId]);
      }
      setSelectedSentenceId(null);
      setCurrentStep(0);
    }
  };

  // --- Logic for Words (Feb 12) ---
  const handleNextWord = () => {
    const currentItems = selectedLesson?.items || [];
    if (currentWordIndex < currentItems.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
    } else {
        // Phase Complete
        if (wordPhase < 2) {
            setWordPhase(wordPhase + 1);
            setCurrentWordIndex(0); // Reset index for next phase
        } else {
            // All phases complete
            setCompletedItems(currentItems.map(i => i.id)); // Mark all as done
            // Show completion screen logic (handled by render)
        }
    }
  };


  const renderLessonList = () => {
    return (
        <div className="flex flex-col items-center space-y-8 animate-fade-in w-full max-w-4xl mx-auto pt-10 px-4">
            <header className="text-center relative">
                <h1 className="text-5xl md:text-6xl font-black text-green-600 mb-4 tracking-tight drop-shadow-sm">
                보윤이의 <span className="text-yellow-500">영어</span> 모험
                </h1>
                <p className="text-xl text-gray-500">공부할 날짜를 선택하세요!</p>
            </header>

            <div className="grid grid-cols-1 gap-6 w-full max-w-xl">
                {LESSONS.map((lesson) => (
                    <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson)}
                        className="relative p-8 rounded-3xl text-left transition-all transform hover:scale-105 hover:shadow-2xl bg-white border-4 border-white shadow-lg flex items-center gap-6 group"
                    >
                        <div className={`p-4 rounded-2xl ${lesson.type === 'sentences' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            <Calendar size={32} />
                        </div>
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${lesson.type === 'sentences' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                                {lesson.date}
                            </span>
                            <h3 className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                                {lesson.title}
                            </h3>
                            <p className="text-gray-400 mt-1">
                                {lesson.items.length} {lesson.type === 'sentences' ? 'sentences' : 'words'} to learn
                            </p>
                        </div>
                    </button>
                ))}
            </div>
             <footer className="mt-12 text-center text-gray-400 text-sm">
                Made with ❤️ for Boyun
             </footer>
        </div>
    );
  };

  const renderSentenceLesson = () => {
    const currentSentence = selectedLesson?.items.find(s => s.id === selectedSentenceId);
    const allCompleted = selectedLesson && completedItems.length === selectedLesson.items.length;

    if (!selectedSentenceId || !currentSentence) {
        // Sentence Selection Menu
        return (
            <div className="flex flex-col items-center space-y-8 animate-fade-in w-full max-w-4xl mx-auto pt-10 px-4">
                {allCompleted && <Confetti />}
                
                <div className="w-full flex justify-between items-center">
                    <button onClick={handleHome} className="flex items-center text-gray-500 hover:text-green-600 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
                        <Home size={20} className="mr-2"/> 다른 날짜 공부하기
                    </button>
                    <h2 className="text-2xl font-bold text-gray-700">{selectedLesson?.date}</h2>
                </div>

                <div className="text-center">
                    <h1 className="text-4xl font-black text-green-600 mb-2">{selectedLesson?.title}</h1>
                    <p className="text-gray-500">오늘의 미션을 모두 완료해보세요!</p>
                </div>

                {allCompleted && (
                    <div className="bg-yellow-100 border-4 border-yellow-400 rounded-3xl p-6 animate-bounce-short shadow-xl w-full max-w-md">
                        <div className="flex flex-col items-center gap-2">
                            <Trophy size={64} className="text-yellow-500 fill-yellow-200" />
                            <h2 className="text-2xl font-bold text-yellow-600">참 잘했어요!</h2>
                            <p className="text-yellow-700">오늘 공부 끝!</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {selectedLesson?.items.map((s) => {
                        const isDone = completedItems.includes(s.id);
                        return (
                            <button
                                key={s.id}
                                onClick={() => handleSelectSentence(s.id)}
                                className={`relative p-6 rounded-3xl text-left transition-all transform hover:scale-105 hover:shadow-xl border-4 ${isDone ? 'bg-green-100 border-green-400' : 'bg-white border-white shadow-lg'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    Mission {s.id}
                                    </span>
                                    {isDone && <Star className="text-yellow-400 fill-current" />}
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">{s.english}</h3>
                                <p className="text-sm text-gray-500 truncate">{s.korean}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Inside Sentence Practice
    const steps = [
        { label: '읽기', color: 'bg-blue-400' },
        { label: '순서', color: 'bg-green-400' },
        { label: '빈칸', color: 'bg-yellow-400' },
        { label: '쓰기', color: 'bg-purple-400' },
    ];

    return (
        <div className="w-full flex flex-col min-h-screen">
            <div className="w-full bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-40">
                <button onClick={() => setSelectedSentenceId(null)} className="flex items-center text-gray-500 hover:text-green-600 font-bold">
                    <BookOpen size={20} className="mr-2"/> 목록으로
                </button>
                <div className="flex gap-1 md:gap-2">
                    {steps.map((s, idx) => (
                    <div key={idx} className={`h-2 w-8 md:w-12 rounded-full transition-colors ${idx <= currentStep ? s.color : 'bg-gray-200'}`} title={s.label}/>
                    ))}
                </div>
                <div className="font-bold text-gray-700">Mission {currentSentence.id}</div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 bg-green-50">
                {currentStep === 0 && <StudyRoom sentence={currentSentence} onComplete={handleNextSentenceStep} />}
                {currentStep === 1 && <PracticeScramble sentence={currentSentence} onComplete={handleNextSentenceStep} />}
                {currentStep === 2 && <PracticeBlanks sentence={currentSentence} onComplete={handleNextSentenceStep} />}
                {currentStep === 3 && <PracticeHandwriting sentence={currentSentence} onComplete={handleNextSentenceStep} />}
            </div>
        </div>
    );
  };

  const renderWordLesson = () => {
    const items = selectedLesson?.items || [];
    const currentWord = items[currentWordIndex];
    const isFinished = completedItems.length === items.length;

    if (isFinished) {
         return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-8 animate-fade-in px-4">
                <Confetti />
                <div className="bg-yellow-100 border-4 border-yellow-400 rounded-3xl p-10 animate-bounce-short shadow-xl text-center max-w-lg">
                    <Trophy size={80} className="text-yellow-500 fill-yellow-200 mx-auto mb-4" />
                    <h2 className="text-4xl font-black text-yellow-600 mb-2">단어 마스터!</h2>
                    <p className="text-xl text-yellow-800">모든 단어를 완벽하게 외웠어요!</p>
                    <button onClick={handleHome} className="mt-8 px-8 py-4 bg-white text-yellow-600 font-bold rounded-full shadow-md hover:bg-yellow-50 transition-transform active:scale-95">
                        다른 공부 하러 가기
                    </button>
                </div>
            </div>
         );
    }

    const phases = [
        { title: '단어 뜻 알기', color: 'bg-blue-500' },
        { title: '영어 단어 찾기', color: 'bg-indigo-500' },
        { title: '듣고 쓰기', color: 'bg-purple-500' },
    ];

    const progressPercent = ((currentWordIndex + 1) / items.length) * 100;

    return (
        <div className="w-full flex flex-col min-h-screen">
             <div className="w-full bg-white shadow-sm p-4 sticky top-0 z-40">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={handleHome} className="flex items-center text-gray-500 hover:text-green-600 font-bold text-sm">
                        <Home size={16} className="mr-1"/> 나가기
                    </button>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${phases[wordPhase].color}`}>
                        {phases[wordPhase].title} ({currentWordIndex + 1}/{items.length})
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${phases[wordPhase].color}`} 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 bg-blue-50">
                {wordPhase === 0 && (
                    <WordQuiz 
                        key={`p0-${currentWord.id}`} // Force remount on change
                        item={currentWord} 
                        allItems={items} 
                        mode="eng-to-kor" 
                        onComplete={handleNextWord} 
                    />
                )}
                {wordPhase === 1 && (
                    <WordQuiz 
                        key={`p1-${currentWord.id}`} 
                        item={currentWord} 
                        allItems={items} 
                        mode="kor-to-eng" 
                        onComplete={handleNextWord} 
                    />
                )}
                {wordPhase === 2 && (
                    <PracticeHandwriting 
                        key={`p2-${currentWord.id}`} 
                        sentence={currentWord} 
                        onComplete={handleNextWord} 
                    />
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] font-sans">
      {!selectedLesson && renderLessonList()}
      {selectedLesson?.type === 'sentences' && renderSentenceLesson()}
      {selectedLesson?.type === 'words' && renderWordLesson()}
    </div>
  );
};

export default App;
