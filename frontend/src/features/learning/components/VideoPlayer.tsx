import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX, Settings } from 'lucide-react';

interface VideoPlayerProps {
  secureLesson: any;
  initialProgress?: number;
  onProgressUpdate?: (seconds: number, progressPercent: number, isCompleted: boolean) => void;
}

export function VideoPlayer({ secureLesson, initialProgress = 0, onProgressUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lastUpdateRef = useRef(0);

  // Since we don't have real SpotPlayer script, we will simulate the video player using standard HTML5 or a mock if no url.
  const videoUrl = secureLesson?.video?.externalId || 'https://www.w3schools.com/html/mov_bbb.mp4'; 
  const isSpotPlayer = secureLesson?.video?.provider === 'spotplayer';

  const [prevLessonId, setPrevLessonId] = useState(secureLesson?._id);

  if (secureLesson?._id !== prevLessonId) {
    setPrevLessonId(secureLesson?._id);
    setIsPlaying(false);
    setProgress(initialProgress);
    setCurrentTime((initialProgress / 100) * (secureLesson?.video?.duration || 0));
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || secureLesson?.video?.duration || 1;
    const currentProgress = (current / total) * 100;
    
    setCurrentTime(current);
    setProgress(currentProgress);

    // Update progress every 10 seconds or if completed
    const now = Date.now();
    const isCompleted = currentProgress >= 90;
    
    if (now - lastUpdateRef.current > 10000 || (isCompleted && lastUpdateRef.current !== -1)) {
      if (onProgressUpdate) {
        onProgressUpdate(current, currentProgress, isCompleted);
      }
      lastUpdateRef.current = isCompleted ? -1 : now; // Prevent multiple completion calls
    }
  };

  const handleEnded = () => {
    if (onProgressUpdate) {
      onProgressUpdate(currentTime, 100, true);
    }
  };

  if (isSpotPlayer) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-gray-800">
        <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <Play className="w-8 h-8 ml-1" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">پلیر اسپات‌پلیر</h3>
        <p className="text-gray-400 mb-6 max-w-md">برای مشاهده این ویدئو، لایسنس زیر را در نرم‌افزار اسپات‌پلیر کپی کنید.</p>
        <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-4 w-full max-w-lg border border-gray-700">
          <code className="text-emerald-400 font-mono text-sm flex-1 truncate select-all">{videoUrl}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative group">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        controls
        controlsList="nodownload"
        poster={secureLesson?.video?.thumbnail}
      />
    </div>
  );
}
