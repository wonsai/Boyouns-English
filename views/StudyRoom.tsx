import React, { useState, useEffect } from 'react';
import { StudyItem } from '../types';
import { Button } from '../components/Button';
import { generateSentenceImage, generateSentenceAudio, playAudioFromBase64 } from '../services/geminiService';
import { Volume2, Image as ImageIcon, ArrowRight, RefreshCw } from 'lucide-react';

interface StudyRoomProps {
  sentence: StudyItem;
  onComplete: () => void;
}

export const StudyRoom: React.FC<StudyRoomProps> = ({ sentence, onComplete }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    // Reset state when sentence changes
    setImageUrl(null);
    setAudioBase64(null);
    setImageError(false);
    
    // Auto-generate image on load
    loadImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence]);

  const loadImage = async () => {
    if (loadingImage || imageUrl) return;
    setLoadingImage(true);
    setImageError(false);
    
    try {
      // 15 second timeout
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 15000)
      );

      // Race between generation and timeout
      const url = await Promise.race([
        generateSentenceImage(sentence.english),
        timeoutPromise
      ]) as string | null;
      
      if (url) {
        setImageUrl(url);
      } else {
        setImageError(true);
      }
    } catch (error) {
      console.error("Image load error/timeout", error);
      setImageError(true);
    } finally {
      setLoadingImage(false);
    }
  };

  const loadAudio = async () => {
    if (loadingAudio || audioBase64) {
      if (audioBase64) playAudioFromBase64(audioBase64);
      return;
    }
    setLoadingAudio(true);
    const base64 = await generateSentenceAudio(sentence.english);
    if (base64) {
      setAudioBase64(base64);
      playAudioFromBase64(base64);
    }
    setLoadingAudio(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-green-200">
        
        {/* Image Area - Updated to object-contain to fix cropping */}
        <div className="relative w-full h-72 bg-green-50 flex items-center justify-center p-2">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="AI Illustration" 
              className="w-full h-full object-contain rounded-xl shadow-sm animate-fade-in bg-white" 
            />
          ) : (
            <div className="text-center p-6 w-full">
              {loadingImage ? (
                <div className="flex flex-col items-center text-green-600">
                  <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm font-bold">그림을 그리고 있어요...</p>
                  <p className="text-xs text-green-500 mt-2 animate-pulse">잠시만 기다려주세요</p>
                </div>
              ) : imageError ? (
                <div className="flex flex-col items-center text-red-400">
                   <ImageIcon size={48} className="mb-2 opacity-50" />
                   <p className="font-bold mb-2">그림을 불러오지 못했어요</p>
                   <button 
                       onClick={loadImage}
                       className="px-4 py-2 bg-white border border-red-200 rounded-full text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                   >
                       <RefreshCw size={14} /> 다시 시도하기
                   </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                   <ImageIcon size={48} className="mb-2 opacity-50" />
                   <p>그림 로딩 중...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="p-8 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 tracking-wide font-sans leading-tight">
            {sentence.english}
          </h2>
          <p className="text-xl md:text-2xl text-gray-500 font-medium font-sans">
            {sentence.korean}
          </p>

          <div className="pt-4 flex justify-center gap-4">
             <Button 
               variant="secondary" 
               onClick={loadAudio} 
               disabled={loadingAudio}
               className="w-full md:w-auto"
             >
               {loadingAudio ? '로딩 중...' : <><Volume2 size={24} /> 듣기 (Listen)</>}
             </Button>
          </div>
        </div>
      </div>

      <div className="w-full pt-4 text-center">
        {loadingImage && !imageUrl && (
             <p className="text-sm text-gray-400 mb-2 animate-pulse">
                그림을 기다리지 않고 넘어가도 돼요!
             </p>
        )}
        <Button variant="primary" size="lg" className="w-full shadow-green-200" onClick={onComplete}>
          다음 단계로! (Go Next) <ArrowRight size={24} />
        </Button>
      </div>
    </div>
  );
};