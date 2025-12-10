import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, RotateCcw, Volume2, VolumeX, X, Navigation } from 'lucide-react';
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
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentDirection, setCurrentDirection] = useState('straight');
  const [distanceToNext, setDistanceToNext] = useState(25);
  const [estimatedTime, setEstimatedTime] = useState('3 min');

  // Initial Safety Check
  useEffect(() => {
    const safetyAccepted = localStorage.getItem('arSafetyAccepted');
    if (!safetyAccepted) {
      setShowSafetyModal(true);
    } else {
      startCamera();
    }
  }, []);

  // Navigation Logic (Simulated for Demo)
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
            className: "bg-success text-success-foreground",
          });
          setIsNavigating(false);
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isNavigating, destination, cameraReady]);

  const startCamera = useCallback(async () => {
    try {
      // Constraints for mobile rear camera
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' }, // Prefer rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for data to load to prevent black screen flashes
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
  }, [toast]);

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

  const handleSafetyAccept = () => {
    setShowSafetyModal(false);
    startCamera();
    setIsNavigating(true);
  };

  const handleCloseCamera = useCallback(() => {
    stopCamera();
    setIsNavigating(false);
    navigate('/home');
  }, [stopCamera, setIsNavigating, navigate]);

  // Enhanced visual arrows
  const getDirectionArrow = () => {
    const arrowClass = "drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-all duration-500";
    
    switch (currentDirection) {
      case 'left':
        return (
          <div className="nav-arrow flex flex-col items-center animate-bounce">
            <svg width="120" height="120" viewBox="0 0 80 80" className="text-white fill-current">
              <path d="M50 15L20 40L50 65" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M20 40H65" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
            </svg>
            <span className={`text-white font-bold text-2xl mt-4 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md ${arrowClass}`}>Turn Left</span>
          </div>
        );
      case 'right':
        return (
          <div className="nav-arrow flex flex-col items-center animate-bounce">
            <svg width="120" height="120" viewBox="0 0 80 80" className="text-white fill-current">
              <path d="M30 15L60 40L30 65" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M60 40H15" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
            </svg>
            <span className={`text-white font-bold text-2xl mt-4 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md ${arrowClass}`}>Turn Right</span>
          </div>
        );
      case 'arrived':
        return (
          <div className="destination-marker flex flex-col items-center animate-bounce">
            <div className="w-24 h-24 rounded-full bg-success flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)]">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <span className={`text-white font-bold text-2xl mt-4 bg-success/80 px-6 py-2 rounded-xl backdrop-blur-md ${arrowClass}`}>You've Arrived!</span>
          </div>
        );
      default: // Straight
        return (
          <div className="nav-arrow flex flex-col items-center animate-pulse">
            <svg width="120" height="120" viewBox="0 0 80 80" className="text-white fill-current">
              <path d="M40 65V15" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
              <path d="M20 35L40 15L60 35" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className={`text-white font-bold text-2xl mt-4 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md ${arrowClass}`}>Go Straight</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black mobile-container">
      {/* Warning Modal */}
      {showSafetyModal && (
        <ARSafetyModal onAccept={handleSafetyAccept} onCancel={() => navigate('/home')} />
      )}

      {/* Main View */}
      <div className="relative w-full h-full">
        {/* Close Button - Always accessible */}
        {!showSafetyModal && (
          <button
            onClick={handleCloseCamera}
            className="absolute top-12 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all active:scale-95"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Camera Error State */}
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background px-6 text-center z-40">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Navigation className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Camera Unavailable</h2>
            <p className="text-muted-foreground mb-8">{cameraError}</p>
            <Button onClick={startCamera} size="lg" className="w-full max-w-xs">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Camera
            </Button>
            <Button variant="ghost" onClick={() => navigate('/home')} className="mt-4">
              Return Home
            </Button>
          </div>
        ) : (
          /* Video Feed */
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Loading Spinner */}
        {!cameraReady && !cameraError && !showSafetyModal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-medium drop-shadow-md">Initializing AR...</p>
          </div>
        )}

        {/* AR Overlay UI */}
        {cameraReady && isNavigating && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 pt-12 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70 font-medium uppercase tracking-wider">Destination</p>
                      <p className="text-white font-bold truncate">
                        {destination?.name || 'Select a destination'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Audio Toggle */}
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center pointer-events-auto active:scale-95 transition-transform"
                >
                  {audioEnabled ? (
                    <Volume2 className="w-5 h-5 text-white" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-white/50" />
                  )}
                </button>
              </div>
            </div>

            {/* Center Direction Indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              {getDirectionArrow()}
            </div>

            {/* Bottom Info Card */}
            <div className="absolute bottom-24 left-6 right-6">
              <div className="bg-card/95 backdrop-blur-xl rounded-[1.5rem] p-5 shadow-2xl border border-white/10 text-card-foreground animate-in slide-in-from-bottom-10 duration-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="block text-2xl font-bold tabular-nums leading-none">
                        {distanceToNext}<span className="text-sm font-normal text-muted-foreground ml-1">m</span>
                      </span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Distance</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-bold">{estimatedTime}</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ETA</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    style={{ width: `${100 - (distanceToNext / 25 * 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                  </div>
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
