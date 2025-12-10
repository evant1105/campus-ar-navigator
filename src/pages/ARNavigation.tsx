import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, MapPin, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
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

  // Check if safety modal was already accepted
  useEffect(() => {
    const safetyAccepted = localStorage.getItem('arSafetyAccepted');
    if (!safetyAccepted) {
      setShowSafetyModal(true);
    } else {
      startCamera();
    }
  }, []);

  // Simulate direction changes
  useEffect(() => {
    if (!isNavigating) return;
    
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
          });
          setIsNavigating(false);
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isNavigating, destination]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setCameraError(null);
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Unable to access camera. Please grant camera permissions.');
      toast({
        title: "Camera Error",
        description: "Please grant camera permissions to use AR navigation",
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
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleSafetyAccept = () => {
    setShowSafetyModal(false);
    startCamera();
    setIsNavigating(true);
  };

  const handleSafetyCancel = () => {
    setShowSafetyModal(false);
    navigate('/home');
  };

  const getDirectionArrow = () => {
    switch (currentDirection) {
      case 'left':
        return (
          <div className="nav-arrow flex flex-col items-center">
            <svg width="80" height="80" viewBox="0 0 80 80" className="text-primary drop-shadow-lg">
              <path d="M50 15L20 40L50 65" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M20 40H65" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
            </svg>
            <span className="text-primary-foreground font-bold text-lg mt-2 drop-shadow-lg">Turn Left</span>
          </div>
        );
      case 'right':
        return (
          <div className="nav-arrow flex flex-col items-center">
            <svg width="80" height="80" viewBox="0 0 80 80" className="text-primary drop-shadow-lg">
              <path d="M30 15L60 40L30 65" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M60 40H15" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
            </svg>
            <span className="text-primary-foreground font-bold text-lg mt-2 drop-shadow-lg">Turn Right</span>
          </div>
        );
      case 'arrived':
        return (
          <div className="destination-marker flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center">
              <MapPin className="w-10 h-10 text-success-foreground" />
            </div>
            <span className="text-primary-foreground font-bold text-lg mt-2 drop-shadow-lg">You've Arrived!</span>
          </div>
        );
      default:
        return (
          <div className="nav-arrow flex flex-col items-center">
            <svg width="80" height="80" viewBox="0 0 80 80" className="text-primary drop-shadow-lg">
              <path d="M40 65V15" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
              <path d="M20 35L40 15L60 35" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="text-primary-foreground font-bold text-lg mt-2 drop-shadow-lg">Go Straight</span>
          </div>
        );
    }
  };

  const handleCloseCamera = useCallback(() => {
    stopCamera();
    setIsNavigating(false);
    navigate('/home');
  }, [stopCamera, setIsNavigating, navigate]);

  return (
    <div className="fixed inset-0 bg-foreground mobile-container">
      {showSafetyModal && (
        <ARSafetyModal onAccept={handleSafetyAccept} onCancel={handleSafetyCancel} />
      )}

      {/* Close Camera Button - Always visible when camera is active */}
      {(cameraReady || cameraError) && !showSafetyModal && (
        <button
          onClick={handleCloseCamera}
          className="absolute top-14 right-5 z-50 w-12 h-12 rounded-full bg-destructive/90 backdrop-blur flex items-center justify-center pointer-events-auto shadow-lg"
          aria-label="Close camera"
        >
          <X className="w-6 h-6 text-destructive-foreground" />
        </button>
      )}

      {/* Camera View */}
      <div className="relative w-full h-full">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-8 text-center">
            <Navigation className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-2">Camera Access Required</p>
            <p className="text-muted-foreground text-sm mb-4">{cameraError}</p>
            <Button onClick={startCamera} variant="default">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* AR Overlay */}
        {cameraReady && isNavigating && (
          <div className="ar-overlay">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-foreground/60 to-transparent p-5 pt-14">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleCloseCamera}
                  className="w-11 h-11 rounded-full bg-card/80 backdrop-blur flex items-center justify-center pointer-events-auto"
                >
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="bg-card/80 backdrop-blur rounded-full px-5 py-2.5">
                  <p className="text-sm font-medium text-foreground">
                    {destination?.name || 'Library Level 2'}
                  </p>
                </div>
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="w-11 h-11 rounded-full bg-card/80 backdrop-blur flex items-center justify-center pointer-events-auto"
                >
                  {audioEnabled ? (
                    <Volume2 className="w-5 h-5 text-foreground" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Direction Arrow (Center) */}
            <div className="absolute inset-0 flex items-center justify-center">
              {getDirectionArrow()}
            </div>

            {/* Bottom Info Panel */}
            <div className="absolute bottom-24 left-0 right-0 p-5">
              <div className="glass-card rounded-2xl p-5 mx-auto max-w-sm pointer-events-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">
                      {distanceToNext}m to next turn
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{estimatedTime}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${100 - (distanceToNext / 25 * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!cameraReady && !cameraError && !showSafetyModal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-foreground font-medium">Initializing AR Camera...</p>
          </div>
        )}
      </div>

      {!showSafetyModal && <BottomNavigation />}
    </div>
  );
};

export default ARNavigation;
