import React, { useRef, useState, useEffect } from 'react';
import { StudyItem } from '../types';
import { Button } from '../components/Button';
import { Eraser, CheckCircle, Pencil, Trash2, Hand, Volume2 } from 'lucide-react';
import { Confetti } from '../components/Confetti';
import { checkHandwriting, generateSentenceAudio, playAudioFromBase64 } from '../services/geminiService';

interface PracticeHandwritingProps {
  sentence: StudyItem;
  onComplete: () => void;
}

type Tool = 'pen' | 'eraser' | 'hand';

export const PracticeHandwriting: React.FC<PracticeHandwritingProps> = ({ sentence, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  // Initialize Canvas & Audio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        canvas.width = 2500;
        canvas.height = 240; 

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          setupContext(ctx, tool);
        }
    }
    
    // Generate audio on mount for dictation feel
    const loadAudio = async () => {
        const audio = await generateSentenceAudio(sentence.english);
        if (audio) {
            setAudioBase64(audio);
            playAudioFromBase64(audio);
        }
    };
    loadAudio();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence]);

  const playAudio = () => {
    if (audioBase64) {
        playAudioFromBase64(audioBase64);
    }
  };

  // Update context when tool changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setupContext(ctx, tool);
      }
    }
  }, [tool]);

  const setupContext = (ctx: CanvasRenderingContext2D, currentTool: Tool) => {
    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#1f2937'; 
      ctx.lineWidth = 4;
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'; 
      ctx.lineWidth = 30; 
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCorrect || tool === 'hand') return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setupContext(ctx, tool);

    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isCorrect || tool === 'hand') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setFeedback(null);
    }
  };

  const handleSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsChecking(true);
    setFeedback(null);
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
    }

    const imageBase64 = tempCanvas.toDataURL('image/png');
    const result = await checkHandwriting(imageBase64, sentence.english);
    
    setIsChecking(false);
    if (result.correct) {
      setIsCorrect(true);
      setShowConfetti(true);
      setFeedback(result.feedback || "정말 잘 썼어요!");
    } else {
      setFeedback(result.feedback || "글씨를 알아보기가 조금 힘들어요. 다시 또박또박 써볼까요?");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-4 space-y-6">
      {showConfetti && <Confetti />}
      
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-blue-500">마지막 단계: 소리 듣고 쓰기</h3>
        <p className="text-sm text-gray-500">
           공책이 부족하면 <strong className="text-blue-600">이동</strong> 버튼을 누르고 옆으로 밀어보세요!
        </p>
        
        <div className="flex items-center justify-center gap-4 bg-white px-8 py-4 rounded-2xl shadow-sm border-2 border-blue-100 inline-block">
            {/* Play Button */}
            <button 
                onClick={playAudio}
                className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors animate-pulse"
                title="다시 듣기"
            >
                <Volume2 size={32} />
            </button>
            <p className="text-4xl font-black text-gray-800 tracking-wide font-sans">{sentence.english}</p>
        </div>
      </div>

      {/* Toolbar */}
      {!isCorrect && (
        <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-2xl shadow-md border border-gray-200">
            <button
                onClick={() => setTool('pen')}
                className={`p-3 rounded-xl transition-colors flex items-center gap-2 ${tool === 'pen' ? 'bg-blue-500 text-white shadow-lg scale-105' : 'hover:bg-gray-100 text-gray-600'}`}
                title="연필"
            >
                <Pencil size={20} /> <span className="text-sm font-bold">연필</span>
            </button>
            <button
                onClick={() => setTool('eraser')}
                className={`p-3 rounded-xl transition-colors flex items-center gap-2 ${tool === 'eraser' ? 'bg-blue-500 text-white shadow-lg scale-105' : 'hover:bg-gray-100 text-gray-600'}`}
                title="지우개"
            >
                <Eraser size={20} /> <span className="text-sm font-bold">지우개</span>
            </button>
            
            <div className="w-px bg-gray-300 mx-1"></div>

            <button
                onClick={() => setTool('hand')}
                className={`p-3 rounded-xl transition-colors flex items-center gap-2 ${tool === 'hand' ? 'bg-green-500 text-white shadow-lg scale-105' : 'hover:bg-gray-100 text-gray-600'}`}
                title="종이 이동"
            >
                <Hand size={20} /> <span className="text-sm font-bold">이동</span>
            </button>

            <div className="w-px bg-gray-300 mx-1"></div>

            <button
                onClick={clearCanvas}
                className="p-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors flex items-center gap-2"
                title="모두 지우기"
            >
                <Trash2 size={20} /> <span className="text-sm font-bold">지우기</span>
            </button>
        </div>
      )}

      {/* Notebook Scroll Container */}
      <div 
        ref={containerRef}
        className="w-full relative rounded-xl shadow-inner overflow-x-auto overflow-y-hidden bg-white border-4 border-gray-300 touch-pan-x"
        style={{ height: '240px', maxWidth: '100%' }}
      >
        <div style={{ width: '2500px', height: '100%', position: 'relative' }}>
            <div className="absolute inset-0 pointer-events-none w-full h-full flex flex-col justify-center select-none">
                <div className="relative w-full h-40">
                     <div className="absolute top-0 w-full h-px bg-red-300 opacity-60"></div>
                     <div className="absolute top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-gray-300"></div>
                     <div className="absolute bottom-0 w-full h-0.5 bg-blue-400 opacity-60"></div>
                </div>
                <div className="absolute top-[calc(50%+4rem)] w-full h-px bg-red-300 opacity-40"></div>
                {[500, 1000, 1500, 2000].map(x => (
                    <div key={x} className="absolute top-0 bottom-0 border-l border-gray-100" style={{ left: x }}></div>
                ))}
            </div>

            <canvas
              ref={canvasRef}
              width={2500}
              height={240}
              className={`absolute top-0 left-0 w-full h-full bg-transparent ${
                  tool === 'hand' 
                  ? 'cursor-grab pointer-events-none' 
                  : tool === 'pen' ? 'cursor-crosshair touch-none' : 'cursor-cell touch-none'
              }`}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl w-full text-center animate-fade-in ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
          <p className="font-bold text-lg">{feedback}</p>
        </div>
      )}

      <div className="flex gap-4">
        {!isCorrect ? (
          <Button variant="primary" onClick={handleSubmit} isLoading={isChecking} disabled={isChecking} className="w-full md:w-auto px-12">
             검사 맡기 (Check)
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
             <div className="flex items-center gap-2 text-3xl font-bold text-blue-500">
               <CheckCircle size={40} /> 미션 완료!
             </div>
             <Button variant="secondary" size="lg" onClick={onComplete}>
               다음으로 넘어가기
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};
