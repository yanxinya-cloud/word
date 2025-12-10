import React, { useState } from 'react';
import { WordEntry } from '../types';
import { RotateCw, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface FlashcardsProps {
  words: WordEntry[];
}

const Flashcards: React.FC<FlashcardsProps> = ({ words }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (words.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
        <Layers size={64} className="mb-6 opacity-20" />
        <h2 className="text-xl font-bold mb-2">No Flashcards Yet</h2>
        <p>Save words to your notebook to practice them here.</p>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
    }, 200);
  };

  const toggleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-primary-50 pb-24">
      <div className="mb-6 flex items-center space-x-2 text-primary-400 font-mono text-sm">
        <span>{currentIndex + 1}</span>
        <span className="h-px w-8 bg-primary-200"></span>
        <span>{words.length}</span>
      </div>

      {/* Card Container with Perspective */}
      <div className="w-full max-w-sm aspect-[3/4] perspective-1000 relative">
        <div 
          className={`w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={toggleFlip}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border border-white">
            <div className="flex-1 flex flex-col items-center justify-center">
              {currentWord.imageUrl && (
                <div className="w-32 h-32 mb-8 rounded-full overflow-hidden border-4 border-primary-100 shadow-inner">
                   <img src={currentWord.imageUrl} className="w-full h-full object-cover" alt="hint" />
                </div>
              )}
              <h2 className="text-4xl font-bold text-gray-800 text-center mb-2">{currentWord.word}</h2>
              <p className="text-primary-400 font-mono text-sm">{currentWord.phonetic}</p>
            </div>
            <p className="text-gray-400 text-xs mt-4">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl shadow-xl text-white p-8 flex flex-col justify-center border border-primary-500">
             <div className="mb-6">
                <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs font-bold mb-2">{currentWord.partOfSpeech}</span>
                <p className="text-xl font-medium leading-relaxed">{currentWord.definition}</p>
             </div>
             <div className="bg-black/20 p-4 rounded-xl">
               <p className="italic text-primary-100 text-sm">"{currentWord.example}"</p>
             </div>
             {currentWord.translation && (
               <div className="mt-6 pt-6 border-t border-white/20 text-center">
                  <p className="text-2xl font-bold">{currentWord.translation}</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-8 mt-10">
        <button onClick={handlePrev} className="p-4 bg-white rounded-full shadow-md text-gray-600 hover:text-primary-600 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <button onClick={toggleFlip} className="p-5 bg-white rounded-full shadow-lg text-primary-600 hover:scale-105 transition-transform">
          <RotateCw size={24} />
        </button>
        <button onClick={handleNext} className="p-4 bg-white rounded-full shadow-md text-gray-600 hover:text-primary-600 transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default Flashcards;
