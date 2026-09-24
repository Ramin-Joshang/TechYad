'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  RotateCw,
  Settings,
  Tv,
  Check,
  SkipForward,
  SkipBack,
  HelpCircle,
  Copy,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface VideoPlayerProps {
  secureLesson: any;
  initialProgress?: number;
  onProgressUpdate?: (seconds: number, progressPercent: number, isCompleted: boolean) => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNextLesson?: boolean;
  hasPrevLesson?: boolean;
  courseTitle?: string;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
}

export function VideoPlayer({
  secureLesson,
  initialProgress = 0,
  onProgressUpdate,
  onNextLesson,
  onPrevLesson,
  hasNextLesson = false,
  hasPrevLesson = false,
  courseTitle = '',
  isTheaterMode = false,
  onToggleTheater,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<number>(0);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [centerAnimation, setCenterAnimation] = useState<'play' | 'pause' | 'seek-forward' | 'seek-backward' | null>(null);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null);
  const [resumePrompt, setResumePrompt] = useState<{ time: number; formatted: string } | null>(null);
  const [hasCopiedLicense, setHasCopiedLicense] = useState(false);

  // SpotPlayer support
  const isSpotPlayer = secureLesson?.video?.provider === 'spotplayer';
  
  // High reliability video source:
  // If no custom video URL is uploaded yet, provide an elegant high-definition developer tutorial video
  const defaultVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const videoUrl = secureLesson?.video?.url || secureLesson?.video?.externalId || secureLesson?.videoUrl || defaultVideoUrl;

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Convert digits to Persian / Farsi
  const toFaDigits = (str: string | number) => {
    return str.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
  };

  // Check saved timestamp for resume
  useEffect(() => {
    if (secureLesson?._id && typeof window !== 'undefined') {
      const savedKey = `tecyad_playback_${secureLesson._id}`;
      const savedSec = parseFloat(localStorage.getItem(savedKey) || '0');
      if (savedSec > 15 && (!videoRef.current || Math.abs(videoRef.current.currentTime - savedSec) > 10)) {
        setResumePrompt({
          time: savedSec,
          formatted: formatTime(savedSec),
        });
      }
    }
  }, [secureLesson?._id]);

  // Handle lesson change
  useEffect(() => {
    setIsPlaying(false);
    setAutoPlayCountdown(null);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      lastUpdateRef.current = 0;
    }
  }, [secureLesson?._id]);

  // Controls auto-hide timeout
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        if (!showSettingsMenu && !showShortcutsModal) {
          setShowControls(false);
        }
      }, 3000);
    }
  }, [isPlaying, showSettingsMenu, showShortcutsModal]);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Center ripple animation trigger
  const triggerCenterAnimation = useCallback((type: 'play' | 'pause' | 'seek-forward' | 'seek-backward') => {
    setCenterAnimation(type);
    setTimeout(() => {
      setCenterAnimation(null);
    }, 600);
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      triggerCenterAnimation('play');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerCenterAnimation('pause');
      setShowControls(true);
    }
  }, [triggerCenterAnimation]);

  const seekDelta = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    triggerCenterAnimation(seconds > 0 ? 'seek-forward' : 'seek-backward');
    handleUserActivity();
  }, [duration, handleUserActivity, triggerCenterAnimation]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.5;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const changeVolume = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolume(clamped);
    videoRef.current.volume = clamped;
    if (clamped === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyT':
          e.preventDefault();
          if (onToggleTheater) onToggleTheater();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekDelta(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekDelta(5);
          break;
        case 'KeyJ':
          e.preventDefault();
          seekDelta(-10);
          break;
        case 'KeyL':
          e.preventDefault();
          seekDelta(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(volume + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(volume - 0.1, 0));
          break;
        case 'KeyP':
          if (hasPrevLesson && onPrevLesson) {
            e.preventDefault();
            onPrevLesson();
          }
          break;
        case 'KeyN':
          if (hasNextLesson && onNextLesson) {
            e.preventDefault();
            onNextLesson();
          }
          break;
        case 'Slash':
          if (e.shiftKey) {
            e.preventDefault();
            setShowShortcutsModal((prev) => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    volume,
    hasNextLesson,
    hasPrevLesson,
    onNextLesson,
    onPrevLesson,
    onToggleTheater,
    togglePlay,
    toggleFullscreen,
    toggleMute,
    seekDelta,
    changeVolume,
  ]);

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettingsMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handlePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not supported or failed', e);
    }
  };

  // Video Event Handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(cur);

    // Save in localStorage for resume
    if (secureLesson?._id && cur > 5) {
      try {
        localStorage.setItem(`tecyad_playback_${secureLesson._id}`, cur.toString());
      } catch {}
    }

    // Buffer progress
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / dur) * 100);
    }

    const currentPercent = (cur / dur) * 100;
    const now = Date.now();
    const isCompleted = currentPercent >= 90;

    // Report progress to parent API every 10s or upon 90% completion
    if (now - lastUpdateRef.current > 10000 || (isCompleted && lastUpdateRef.current !== -1)) {
      if (onProgressUpdate) {
        onProgressUpdate(cur, currentPercent, isCompleted);
      }
      lastUpdateRef.current = isCompleted ? -1 : now;
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);

    // Initial seek if initialProgress was provided
    if (initialProgress > 0 && initialProgress < 90) {
      const targetSec = (initialProgress / 100) * (videoRef.current.duration || 0);
      if (targetSec > 5) {
        videoRef.current.currentTime = targetSec;
        setCurrentTime(targetSec);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onProgressUpdate) {
      onProgressUpdate(duration, 100, true);
    }
    // Autoplay next lesson countdown if available
    if (hasNextLesson && onNextLesson) {
      setAutoPlayCountdown(5);
    }
  };

  // Countdown timer for next lesson
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoPlayCountdown !== null && autoPlayCountdown > 0) {
      timer = setTimeout(() => {
        setAutoPlayCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (autoPlayCountdown === 0) {
      setAutoPlayCountdown(null);
      if (onNextLesson) onNextLesson();
    }
    return () => clearTimeout(timer);
  }, [autoPlayCountdown, onNextLesson]);

  // Timeline scrubber interactions
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    const targetTime = clampedPos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    setHoverPosition(clampedPos * 100);
    setHoverTime(clampedPos * duration);
  };

  const handleScrubberMouseLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };

  const handleResumePlayback = () => {
    if (resumePrompt && videoRef.current) {
      videoRef.current.currentTime = resumePrompt.time;
      setCurrentTime(resumePrompt.time);
      videoRef.current.play();
      setIsPlaying(true);
      setResumePrompt(null);
    }
  };

  // SPOTPLAYER SPECIAL UI
  if (isSpotPlayer) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          پخش امن اختصاصی اسپات‌پلیر
        </div>

        <div className="w-20 h-20 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-blue-500/10 animate-pulse">
          <Play className="w-10 h-10 ml-1 text-blue-400" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">پخش تحت برنامه SpotPlayer</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-lg leading-relaxed">
          ویدیوهای این درس به صورت اختصاصی کدگذاری شده‌اند. لطفاً لایسنس فعال‌سازی زیر را کپی کرده و در برنامه اسپات‌پلیر باز فرمایید.
        </p>

        <div className="bg-slate-900/90 p-3.5 rounded-xl flex items-center gap-3 w-full max-w-lg border border-slate-800 shadow-inner">
          <code className="text-emerald-400 font-mono text-xs sm:text-sm flex-1 truncate select-all text-left dir-ltr">
            {videoUrl}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(videoUrl);
              setHasCopiedLicense(true);
              setTimeout(() => setHasCopiedLicense(false), 2500);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shrink-0"
          >
            {hasCopiedLicense ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {hasCopiedLicense ? 'کپی شد' : 'کپی لایسنس'}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>نسخه ویندوز، مک و اندروید</span>
          <span>•</span>
          <span>پخش بدون افت کیفیت</span>
          <span>•</span>
          <span>محافظت از حق مؤلف تک‌یاد</span>
        </div>
      </div>
    );
  }

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full aspect-video bg-black select-none overflow-hidden group font-sans transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen rounded-none' : 'rounded-2xl border border-slate-800 shadow-2xl'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={secureLesson?.video?.thumbnail || secureLesson?.thumbnail}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Security Floating Brand Watermark (Tecyad) */}
      <div className="absolute top-6 left-6 pointer-events-none select-none opacity-20 hover:opacity-40 transition flex items-center gap-1.5 text-[11px] font-mono tracking-widest text-white/70 uppercase">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
        <span>Tecyad Stream</span>
      </div>

      {/* Resume Playback Prompt Toast */}
      {resumePrompt && (
        <div className="absolute bottom-20 left-6 z-30 bg-slate-900/95 backdrop-blur-md text-white border border-blue-500/40 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <div className="text-xs">
            ادامه پخش از دقیقه <span className="font-bold text-blue-400 font-mono">{toFaDigits(resumePrompt.formatted)}</span>؟
          </div>
          <button
            onClick={handleResumePlayback}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
          >
            ادامه
          </button>
          <button
            onClick={() => setResumePrompt(null)}
            className="text-slate-400 hover:text-white text-xs px-1.5 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Autoplay Next Lesson Overlay */}
      {autoPlayCountdown !== null && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin mb-4 flex items-center justify-center text-xl font-bold font-mono text-blue-400">
            {toFaDigits(autoPlayCountdown)}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">جلسه بعدی تا لحظاتی دیگر شروع می‌شود</h3>
          <p className="text-slate-400 text-xs mb-6 max-w-sm">در حال انتقال خودکار به درس بعدی دوره آموزشی...</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAutoPlayCountdown(null);
                if (onNextLesson) onNextLesson();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <SkipForward className="w-4 h-4" /> پخش فوری جلسه بعد
            </button>
            <button
              onClick={() => setAutoPlayCountdown(null)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition border border-slate-700"
            >
              لغو پخش خودکار
            </button>
          </div>
        </div>
      )}

      {/* Center Screen Ripple Animation Icons */}
      {centerAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-20 h-20 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl scale-125 animate-ping opacity-75">
            {centerAnimation === 'play' && <Play className="w-10 h-10 ml-1 text-white fill-white" />}
            {centerAnimation === 'pause' && <Pause className="w-10 h-10 text-white fill-white" />}
            {centerAnimation === 'seek-forward' && <RotateCw className="w-10 h-10 text-blue-400" />}
            {centerAnimation === 'seek-backward' && <RotateCcw className="w-10 h-10 text-blue-400" />}
          </div>
        </div>
      )}

      {/* Big Initial Play Button if Paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10 transition-opacity"
        >
          <div className="w-20 h-20 rounded-full bg-blue-600/90 hover:bg-blue-500 hover:scale-110 text-white flex items-center justify-center shadow-2xl shadow-blue-600/50 transition-transform duration-200 border-2 border-white/30 backdrop-blur-xs">
            <Play className="w-9 h-9 ml-1 fill-white" />
          </div>
        </div>
      )}

      {/* Top Header Overlay Bar (Auto-hide) */}
      <div
        className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <div>
            <h2 className="text-white text-xs sm:text-sm font-bold line-clamp-1 drop-shadow-md">
              {secureLesson?.title || 'عنوان جلسه'}
            </h2>
            {courseTitle && (
              <p className="text-[11px] text-slate-300 line-clamp-1 font-medium drop-shadow-sm opacity-80">
                {courseTitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Keyboard Shortcuts Button */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            title="راهنمای کلیدهای میانبر (Shift + /)"
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Controls Bar (Auto-hide) */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 z-20 transition-opacity duration-300 flex flex-col justify-end ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Scrubber */}
        <div
          ref={progressBarRef}
          onClick={handleScrubberClick}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={handleScrubberMouseLeave}
          className="relative w-full h-2 group/scrubber flex items-center cursor-pointer mb-3"
        >
          {/* Hover Time Tooltip */}
          {hoverPosition !== null && hoverTime !== null && (
            <div
              className="absolute -top-8 -translate-x-1/2 bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow border border-slate-700 pointer-events-none z-30"
              style={{ left: `${hoverPosition}%` }}
            >
              {toFaDigits(formatTime(hoverTime))}
            </div>
          )}

          {/* Background Bar */}
          <div className="w-full h-1 group-hover/scrubber:h-2 bg-white/20 rounded-full overflow-hidden transition-all duration-200">
            {/* Buffered progress */}
            <div
              className="h-full bg-white/30 transition-all duration-150"
              style={{ width: `${buffered}%` }}
            />
          </div>

          {/* Played progress */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1 group-hover/scrubber:h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full pointer-events-none transition-all duration-75"
            style={{ width: `${playedPercent}%` }}
          />

          {/* Scrubber Knob Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md border-2 border-blue-500 scale-0 group-hover/scrubber:scale-100 transition-transform pointer-events-none"
            style={{ left: `calc(${playedPercent}% - 7px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left Controls: Play, Seek, Volume, Timers */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-blue-400 transition"
              title={isPlaying ? 'توقف (Space / K)' : 'پخش (Space / K)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Prev / Next Lesson quick jumps */}
            {hasPrevLesson && (
              <button
                onClick={onPrevLesson}
                title="جلسه قبل (P)"
                className="p-1.5 text-slate-300 hover:text-white transition"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            {/* Seek -10s */}
            <button
              onClick={() => seekDelta(-10)}
              title="۱۰ ثانیه به عقب (J)"
              className="p-1.5 text-slate-300 hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Seek +10s */}
            <button
              onClick={() => seekDelta(10)}
              title="۱۰ ثانیه به جلو (L)"
              className="p-1.5 text-slate-300 hover:text-white transition"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {hasNextLesson && (
              <button
                onClick={onNextLesson}
                title="جلسه بعد (N)"
                className="p-1.5 text-slate-300 hover:text-white transition"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:text-blue-400 transition"
                title={isMuted ? 'صدادار کردن (M)' : 'بی‌صدا کردن (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-blue-500 opacity-80 hover:opacity-100 transition"
              />
            </div>

            {/* Time Stamp (Current / Total) */}
            <div className="text-[11px] font-mono text-slate-300 dir-ltr select-none mr-2">
              <span className="text-white font-semibold">{toFaDigits(formatTime(currentTime))}</span>
              <span className="mx-1 text-slate-500">/</span>
              <span>{toFaDigits(formatTime(duration))}</span>
            </div>
          </div>

          {/* Right Controls: Speed, Theater, Fullscreen, Settings */}
          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Speed Selector Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu((prev) => !prev)}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold rounded-md transition flex items-center gap-1"
                title="سرعت و کیفیت پخش"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{playbackSpeed}x</span>
              </button>

              {/* Speed & Quality Popover Menu */}
              {showSettingsMenu && (
                <div className="absolute bottom-10 left-0 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-2 rounded-xl shadow-2xl z-50 min-w-[150px] space-y-1 text-right text-xs">
                  <div className="px-2 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-800">
                    سرعت پخش
                  </div>
                  {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-right transition ${
                        playbackSpeed === s ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-mono">{s}x</span>
                      {playbackSpeed === s && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}

                  <div className="px-2 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-800 pt-2">
                    کیفیت ویدیو
                  </div>
                  {['1080p', '720p', '480p'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q);
                        setShowSettingsMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-right transition ${
                        quality === q ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-mono">{q}</span>
                      {quality === q && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              onClick={handlePiP}
              title="تصویر در تصویر (PiP)"
              className="p-1.5 text-slate-300 hover:text-white transition hidden sm:block"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Theater Mode Toggle */}
            {onToggleTheater && (
              <button
                onClick={onToggleTheater}
                title={isTheaterMode ? 'حالت عادی (T)' : 'حالت سینمایی (T)'}
                className={`p-1.5 rounded-md transition ${
                  isTheaterMode ? 'text-blue-400 bg-blue-500/20' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Tv className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-blue-400 transition"
              title={isFullscreen ? 'خروج از تمام‌صفحه (F)' : 'تمام‌صفحه (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Cheat-Sheet Modal */}
      {showShortcutsModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-right shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                کلیدهای میانبر پلیر تک‌یاد
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700">Space / K</span>
                <span>پخش / توقف ویدیو</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700">F</span>
                <span>حالت تمام‌صفحه</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700">T</span>
                <span>حالت سینمایی (Theater)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700">M</span>
                <span>بی‌صدا / باصدا</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700">J / L</span>
                <span>۱۰ ثانیه عقب / جلو</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700">Arrow Left / Right</span>
                <span>۵ ثانیه عقب / جلو</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700">Arrow Up / Down</span>
                <span>افزایش / کاهش صدا</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700">P / N</span>
                <span>جلسه قبل / بعد</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
