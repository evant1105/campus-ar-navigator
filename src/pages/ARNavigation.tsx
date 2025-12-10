import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, RotateCcw, Volume2, VolumeX, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/contexts/NavigationContext';
import ARSafetyModal from '@/components/ARSafetyModal';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

const ARNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { destination, isNavigating, setIsNavigating } = useNavigation();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Modal State (Lazy init to prevent flicker)
  const [showSafetyModal, setShowSafetyModal] = useState(() => {
    const accepted = localStorage.getItem('arSafetyAccepted');
    return accepted !== 'true'; 
  });

  // Navigation UI State
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentDirection, setCurrentDirection] = useState('straight');
  const [distanceToNext, setDistanceToNext] = useState(25);
  const [estimatedTime, setEstimatedTime] = useState('3 min');

  // --- 1. Camera Initialization ---
  const startCamera = useCallback(async () => {
    if (showSafetyModal) return; // Don't start if modal is open

    setIsNavigating(true);
    setCameraError(null);

    try {
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' }, // Rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      console.log("Starting camera...");
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please check permissions.');
      toast({
        title: "Camera Failed",
        description: "Could not access the camera. Please check settings.",
        variant: "destructive",
      });
    }
  }, [showSafetyModal, setIsNavigating, toast]);

  // --- 2. Attach Stream to Video ---
  useEffect(() => {
    if (stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      
      // Critical for mobile: Explicitly play when metadata loads
      video.onloadedmetadata = () => {
        video.play()
          .then(() => {
            console.log("Video playing");
            setCameraReady(true);
          })
          .catch(e => {
            console.error("Play error:", e);
            // Sometimes interacting with the page helps, but autoPlay attr usually handles this
          });
      };
    }
  }, [stream]);

  // --- 3. Lifecycle Management ---
  
  // Start camera when modal closes
  useEffect(() => {
    if (!showSafetyModal && !stream) {
      startCamera();
    }
  }, [showSafetyModal, stream, startCamera]);

  // Stop camera on unmount or close
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraReady(false);
  }, [stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleCloseCamera = () => {
    stopCamera();
    setIsNavigating(false);
    navigate('/home');
  };

  const handleSafetyAccept = () => {
    setShowSafetyModal(false);
    // startCamera will trigger via useEffect
  };

  // --- 4. Navigation Simulation (Demo Logic) ---
  useEffect(() => {
    if (!isNavigating || !cameraReady) return;
    
    const interval = setInterval(() => {
      setDistanceToNext(prev => {
        if (prev <= 0) {
          setCurrentDirection('arrived');
          return 0;
        }
        return Math.max(0, prev - 2); // Decrease distance
      });
    }, 2000); // Slower update for demo

    return () => clearInterval(interval);
  }, [isNavigating, cameraReady]);


  // --- 5. Render Helpers ---
  const getDirectionArrow = () => {
    // Styling ensuring high visibility
    const containerClass = "flex flex-col items-center animate-pulse drop-shadow-2xl";
    const textClass = "text-white font-bold text-2xl mt-4 bg-black/60 px-6 py-2 rounded-xl backdrop-blur-md border border-white/20";
    const arrowColor = "text-white fill-white filter drop-shadow-lg";

    if (currentDirection === 'arrived') {
      return (
        <div className="flex flex-col items-center animate-bounce">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg border-4 border-white">
            <MapPin className="w-12 h-12 text-white" />
          </div>
          <span className="text-white font-bold text-2xl mt-4 bg-green-600 px-6 py-2 rounded-xl">
            You've Arrived!
          </span>
        </div>
      );
    }

    return (
      <div className={containerClass}>
        <svg width="100" height="100" viewBox="0 0 24 24" className={arrowColor}>
          <path d="M12 2L12 19M12 2L5 9M12 2L19 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className={textClass}>Go Straight</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      
      {/* 1. Safety Modal */}
      {showSafetyModal && (
        <ARSafetyModal onAccept={handleSafetyAccept} onCancel={() => navigate('/home')} />
      )}

      {/* 2. Main Camera Layer */}
      <div className="relative w-full h-full overflow-hidden">
        
        {/* Camera Feed */}
        {!cameraError && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Loading State */}
        {!cameraReady && !cameraError && !showSafetyModal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
            <div className="w-12 h-12 border-4 border-white/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-white font-medium">Starting Camera...</p>
          </div>
        )}

        {/* Error State */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 px-6 text-center z-50">
            <Navigation className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Camera Error</h2>
            <p className="text-zinc-400 mb-6">{cameraError}</p>
            <div className="flex gap-3">
              <Button onClick={startCamera} variant="default">Retry</Button>
              <Button onClick={() => navigate('/home')} variant="secondary">Cancel</Button>
            </div>
          </div>
        )}

        {/* 3. AR Overlay UI (Only visible when camera is ready) */}
        {cameraReady && isNavigating && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
            
            {/* Top Bar */}
            <div className="p-4 pt-12 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent">
              {/* Close Button */}
              <button 
                onClick={handleCloseCamera}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center pointer-events-auto active:scale-95 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Destination Pill */}
              <div className="flex-1 bg-black/40 backdrop-blur rounded-full h-12 px-4 flex items-center gap-3 border border-white/10">
                <Navigation className="w-5 h-5 text-primary fill-primary" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-white font-semibold truncate text-sm">
                    {destination?.name || 'Destination'}
                  </p>
                </div>
              </div>

              {/* Audio Toggle */}
              <button 
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center pointer-events-auto"
              >
                {audioEnabled ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white/50" />}
              </button>
            </div>

            {/* Center Arrow */}
            <div className="flex-1 flex items-center justify-center pb-20">
              {getDirectionArrow()}
            </div>

            {/* Bottom Info Card */}
            <div className="p-6 pb-8">
              <div className="bg-white rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">{distanceToNext}</span>
                        <span className="text-sm font-medium text-slate-500">m</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Distance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">{estimatedTime}</p>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ETA</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${Math.min(100, Math.max(0, 100 - (distanceToNext / 50 * 100)))}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Bottom Nav (Only if not in modal) */}
      {!showSafetyModal && <BottomNavigation className="bg-black/90 border-t-white/10 text-white" />}
    </div>
  );
};

export default ARNavigation;