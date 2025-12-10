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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // FIX: Initialize state directly from localStorage function
  // This prevents the camera from starting for a split second if the value exists
  const [showSafetyModal, setShowSafetyModal] = useState(() => {
    const accepted = localStorage.getItem('arSafetyAccepted');
    return accepted !== 'true'; // Show modal if NOT 'true'
  });

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentDirection, setCurrentDirection] = useState('straight');
  const [distanceToNext, setDistanceToNext] = useState(25);
  const [estimatedTime, setEstimatedTime] = useState('3 min');

  // Start Camera Logic
  const startARSession = useCallback(async () => {
    // Only start if modal is NOT shown
    if (showSafetyModal) return;

    setIsNavigating(true);
    try {
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' }, 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadeddata = () => {
          setCameraReady(true);
          setCameraError(null);
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Please allow camera access to use AR features.');
      toast({
        title: "Camera Access Required",
        description: "We couldn't access your camera. Please check your settings.",
        variant: "destructive",
      });
    }
  }, [setIsNavigating, toast, showSafetyModal]);

  // Trigger camera start ONLY when modal is dismissed/not shown
  useEffect(() => {
    if (!showSafetyModal && !stream) {
      startARSession();
    }
  }, [showSafetyModal, stream, startARSession]);

  // Cleanup
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

  // Navigation Simulation
  useEffect(() => {
    if (!isNavigating || !cameraReady) return;
    
    const directions = ['straight', 'left', 'right', 'arrived'];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < directions.length - 1) {
        index++;
        setCurrentDirection(directions[index]);
        setDistanceToNext(Math.max(5, distanceToNext - 8));
        
        if (directions[index] === 'arrived') {
          toast({
            title: "You've arrived!",
            description: destination?.name || "Your destination",
            className: "bg-green-600 text-white border-none",
          });
          setIsNavigating(false);
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isNavigating, destination, cameraReady]);

  const handleSafetyAccept = () => {
    setShowSafetyModal(false);
    // The useEffect above will detect this change and start the camera
  };

  const handleCloseCamera = useCallback(() => {
    stopCamera();
    setIsNavigating(false);
    navigate('/home');
  }, [stopCamera, setIsNavigating, navigate]);

  const getDirectionArrow = () => {
    // ... (Arrow logic remains the same)
    const arrowStyle = "drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]";
    const labelStyle = "text-white font-bold text-2xl mt-6 bg-black/60 px-6 py-2 rounded-xl backdrop-blur-md shadow-lg border border-white/10";
    
    switch (currentDirection) {
      case 'left':
        return (
          <div className="nav-arrow flex flex-col items-center animate-bounce">
            <svg width="120" height="120" viewBox="0 0 80 80" className={`text-white fill-none stroke-current ${arrowStyle}`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50 15L20 40L50 65" />
              <path d="M20 40H65" />
            </svg>
            <span className={labelStyle}>Turn Left</span>
          </div>
        );
      case 'right':
        return (
          <div className="nav-arrow flex flex-col items-center animate-bounce">
            <svg width="120" height="120" viewBox="0 0 80 80" className={`text-white fill-none stroke-current ${arrowStyle}`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M30 15L60 40L30 65" />
              <path d="M60 40H15" />
            </svg>
            <span className={labelStyle}>Turn Right</span>
          </div>
        );
      case 'arrived':
        return (
          <div className="destination-marker flex flex-col items-center animate-bounce">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)] border-4 border-white">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <span className="text-white font-bold text-2xl mt-6 bg-green-600 px-8 py-3 rounded-xl shadow-lg border border-green-400">You've Arrived!</span>
          </div>
        );
      default:
        return (
          <div className="nav-arrow flex flex-col items-center animate-pulse">
            <svg width="120" height="120" viewBox="0 0 80 80" className={`text-white fill-none stroke-current ${arrowStyle}`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 65V15" />
              <path d="M20 35L40 15L60 35" />
            </svg>
            <span className={labelStyle}>Go Straight</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black mobile-container">
      {/* Safety Warning Modal - Rendered Conditionally */}
      {showSafetyModal && (
        <ARSafetyModal onAccept={handleSafetyAccept} onCancel={() => navigate('/home')} />
      )}

      {/* Main View Area */}
      <div className="relative w-full h-full">
        {/* Close Button */}
        {!showSafetyModal && (
          <button
            onClick={handleCloseCamera}
            className="absolute top-14 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all active:scale-95 shadow-lg"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Camera Error UI */}
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background px-8 text-center z-40">
            <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Navigation className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Camera Unavailable</h2>
            <p className="text-muted-foreground mb-8 text-lg">{cameraError}</p>
            <Button onClick={startARSession} size="lg" className="w-full h-14 text-lg rounded-xl">
              <RotateCcw className="w-5 h-5 mr-2" />
              Retry Camera
            </Button>
            <Button variant="ghost" onClick={() => navigate('/home')} className="mt-4 h-14 text-lg">
              Return Home
            </Button>
          </div>
        ) : (
          /* Live Camera Feed */
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Loading Spinner - Only show if modal is gone and camera not ready */}
        {!cameraReady && !cameraError && !showSafetyModal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/10 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-white/30 border-t-primary rounded-full animate-spin mb-4 shadow-xl" />
            <p className="text-white font-medium text-lg drop-shadow-md">Initializing AR...</p>
          </div>
        )}

        {/* AR Overlay */}
        {cameraReady && isNavigating && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Top Info Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 pt-14 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-inner">
                      <Navigation className="w-6 h-6 text-white" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-white/80 font-semibold uppercase tracking-wider mb-0.5">Navigating To</p>
                      <p className="text-white font-bold text-lg truncate">
                        {destination?.name || 'Destination'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="w-14 h-14 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center pointer-events-auto active:scale-95 transition-transform"
                >
                  {audioEnabled ? (
                    <Volume2 className="w-6 h-6 text-white" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-white/50" />
                  )}
                </button>
              </div>
            </div>

            {/* Center Direction Indicator */}
            <div className="absolute inset-0 flex items-center justify-center pb-20">
              {getDirectionArrow()}
            </div>

            {/* Bottom Distance Card */}
            <div className="absolute bottom-28 left-6 right-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 text-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <span className="block text-3xl font-bold tabular-nums">
                        {distanceToNext}<span className="text-lg font-medium text-slate-500 ml-1">m</span>
                      </span>
                      <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Distance to turn</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-bold">{estimatedTime}</span>
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">ETA</span>
                  </div>
                </div>
                
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${100 - (distanceToNext / 25 * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!showSafetyModal && <BottomNavigation />}
    </div>
  );
};

export default ARNavigation;