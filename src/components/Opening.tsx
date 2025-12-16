import { useEffect, useState } from 'react';

interface OpeningProps {
  onComplete: () => void;
}

export default function Opening({ onComplete }: OpeningProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div>
        </div>
      )}

      <video
        className="w-full h-full object-contain"
        style={{ transform: 'scale(1.2)' }}
        autoPlay
        playsInline
        muted
        onEnded={handleVideoEnd}
        onLoadedData={handleVideoLoad}
      >
        <source
          src="/dezajuku_logo_3sec_1217_1.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  );
}
