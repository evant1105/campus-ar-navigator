import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, RotateCcw, Volume2, VolumeX, X, Navigation, Shield, ShieldAlert, Activity } from 'lucide-react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Lazy initialization for modal state
  const [showSafetyModal, setShowSafetyModal] = useState(() => {
    const accepted = localStorage.getItem('arSafetyAccepted');
    return accepted !== 'true'; 
  });

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // AI Obstacle Detector State
  const [safetyGuardEnabled, setSafetyGuardEnabled] = useState(true);
  const [obstacleWarning, setObstacleWarning] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'scanning' | 'clear' | 'warning'>('scanning');

  // Navigation State
  const [currentDirection, setCurrentDirection] = useState('straight');
  const [distanceToNext, setDistanceToNext] = useState(25);
  const [estimatedTime, setEstimatedTime] = useState('3 min');

  // --- 1. Camera Start Logic (Fixed for Speed & Reliability) ---
  const startARSession = useCallback(async () => {
    if (showSafetyModal) return;

    setIsNavigating(true);
    try {
      // Constraints optimized for mobile performance
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' }, // Prefer rear camera
          width: { ideal: 1280 }, // Good balance of quality/perf
          height: { ideal: 720 },
          frameRate: { ideal: 30 } // Smoother motion
        },
        audio: false // Critical: Requesting audio can trigger permission blocks on some browsers
      };

      console.log("Requesting camera...");
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      // Video element handling is now done in the useEffect below
    } catch (error) {
      console.error('Camera error:', error);
      let errorMessage = 'Please allow camera access to use AR features.';
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') errorMessage = 'Camera permission denied. Please enable it in settings.';
        if (error.name === 'NotFoundError') errorMessage = 'No camera found on this device.';
        if (error.name === 'NotReadableError') errorMessage = 'Camera is busy or not readable. Try restarting your browser.';
      }

      setCameraError(errorMessage);
      toast({
        title: "Camera Access Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [setIsNavigating, toast, showSafetyModal]);

  // --- 2. Stream Handling & "Black Screen" Fix ---
  useEffect(() => {
    if (videoRef.current && stream) {
      const video = videoRef.current;
      video.srcObject = stream;

      // CRITICAL FIX: Mobile browsers need explicit play() call
      video.onloadedmetadata = () => {
        setCameraReady(true);
        setCameraError(null);
        video.play().catch(e => console.error("Video play failed:", e));
      };
    }
  }, [stream]);

  // Trigger start when modal is closed
  useEffect(() => {
    if (!showSafetyModal && !stream) startARSession();
  }, [showSafetyModal, stream, startARSession]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraReady(false);
  }, [stream]);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  // --- 3. AI Obstacle Simulation ---
  useEffect(() => {
    if (!cameraReady || !safetyGuardEnabled || !videoRef.current || !canvasRef.current) return;

    const checkFrame = () => {
      // Safety check to ensure video is actually playing
      if (videoRef.current?.paused || videoRef.current?.ended) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Draw small frame for performance
      canvasRef.current.width = 100;
      canvasRef.current.height = 100;
      
      try {
        ctx.drawImage(videoRef.current, 0, 0, 100, 100);
        const frame = ctx.getImageData(0, 0, 100, 100);
        const data = frame.data;
        
        // Simple Brightness Check
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avgBrightness = totalBrightness / (data.length / 4);

        if (avgBrightness < 20) {
          setObstacleWarning("Low Light: Step Carefully");
          setScanStatus('warning');
        } else {
          // Simulated obstacle detection
          if (Math.random() > 0.99) { 
            setObstacleWarning("Watch Your Step!");
            setScanStatus('warning');
            setTimeout(() => {
              setObstacleWarning(null);
              setScanStatus('scanning');
            }, 3000);
          } else if (!obstacleWarning) {
            setObstacleWarning(null);
            setScanStatus('clear');
          }
        }
      } catch (e) {
        // Ignore frame read errors (common if camera is switching)
      }
    };

    const interval = setInterval(checkFrame, 500); 
    return () => clearInterval(interval);
  }, [cameraReady, safetyGuardEnabled, obstacleWarning]);

  // --- 4. Navigation Simulation ---
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
          toast({ title: "You've arrived!", description: destination?.name || "Destination", className: "bg-green-600 text-white border-none" });
          setIsNavigating(false);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isNavigating, destination, cameraReady]);

  const handleSafetyAccept = () => setShowSafetyModal(false);
  const handleCloseCamera = useCallback(() => { stopCamera(); setIsNavigating(false); navigate('/home'); }, [stopCamera, setIsNavigating, navigate]);

  const getDirectionArrow = () => {
    const arrowStyle = "drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]";
    const labelStyle = "text-white font-bold text-2xl mt-6 bg-black/60 px-6 py-2 rounded-xl backdrop-blur-md shadow-lg border border-white/10";
    
    if (currentDirection === 'arrived') return (
      <div className="destination-marker flex flex-col items-center animate-bounce">
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)] border-4 border-white">
          <MapPin className="w-12 h-12 text-white" />
        </div>
        <span className="text-white font-bold text-2xl mt-6 bg-green-600 px-8 py-3 rounded-xl shadow-lg border border-green-400">You've Arrived!</span>
      </div>
    );
    
    return (
      <div className="nav-arrow flex flex-col items-center animate-pulse">
        <svg width="120" height="120" viewBox="0 0 80 80" className={`text-white fill-none stroke-current ${arrowStyle}`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          {currentDirection === 'left' && <><path d="M50 15L20 40L50 65" /><path d="M20 40H65" /></>}
          {currentDirection === 'right' && <><path d="M30 15L60 40L30 65" /><path d="M60 40H15" /></>}
          {currentDirection === 'straight' && <><path d="M40 65V15" /><path d="M20 35L40 15L60 35" /></>}
        </svg>
        <span className={labelStyle}>
          {currentDirection === 'left' ? 'Turn Left' : currentDirection === 'right' ? 'Turn Right' : 'Go Straight'}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black mobile-container">
      {/* Modal */}
      {showSafetyModal && <ARSafetyModal onAccept={handleSafetyAccept} onCancel={() => navigate('/home')} />}

      {/* Main AR View */}
      <div className="relative w-full h-full">
        {!showSafetyModal && (
          <button onClick={handleCloseCamera} className="absolute top-14 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all active:scale-95 shadow-lg">
            <X className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Video & AI Canvas */}
        {!cameraError && (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline // CRITICAL for iOS
              muted // CRITICAL for Autoplay
              className={`w-full h-full object-cover transition-opacity duration-500 ${cameraReady ? 'opacity-100' : 'opacity-0'}`} 
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        {/* Obstacle Detection HUD */}
        {cameraReady && safetyGuardEnabled && (
          <div className="absolute top-28 left-6 right-6 z-30 pointer-events-none">
            {obstacleWarning ? (
              <div className="bg-red-500/90 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-top-5 shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400">
                <div className="bg-white/20 p-2 rounded-full animate-pulse">
                  <ShieldAlert className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">CAUTION</h3>
                  <p className="text-white/90 text-sm font-medium">{obstacleWarning}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                  <span className="text-white/80 text-xs font-medium tracking-wide uppercase">AI Path Scan Active</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {!cameraReady && !cameraError && !showSafetyModal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/10 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-white/30 border-t-primary rounded-full animate-spin mb-4 shadow-xl" />
            <p className="text-white font-medium text-lg drop-shadow-md">Initializing AR & AI...</p>
          </div>
        )}

        {/* Error State */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background px-8 text-center z-40">
            <Navigation className="w-12 h-12 text-destructive mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Camera Error</h2>
            <p className="text-muted-foreground mb-8 text-lg">{cameraError}</p>
            <Button onClick={() => { setCameraError(null); startARSession(); }} size="lg" className="w-full h-14 text-lg rounded-xl">Retry</Button>
            <Button variant="ghost" onClick={() => navigate('/home')} className="mt-4 h-14 text-lg">Back</Button>
          </div>
        )}

        {/* Navigation Overlay */}
        {cameraReady && isNavigating && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6