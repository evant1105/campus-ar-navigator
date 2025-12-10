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
  const canvasRef = useRef<HTMLCanvasElement>(null); // For AI analysis
  const [stream, setStream] = useState<MediaStream | null>(null);
  
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

  // --- AI Obstacle Simulation Logic ---
  useEffect(() => {
    if (!cameraReady || !safetyGuardEnabled || !videoRef.current || !canvasRef.current) return;

    const checkFrame = () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Draw current video frame to canvas (small size for performance)
      canvasRef.current.width = 100;
      canvasRef.current.height = 100;
      ctx.drawImage(videoRef.current, 0, 0, 100, 100);
      
      const frame = ctx.getImageData(0, 0, 100, 100);
      const data = frame.data;
      
      // 1. Brightness Check
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const avgBrightness = totalBrightness / (data.length / 4);

      if (avgBrightness < 30) {
        setObstacleWarning("Low Light: Watch your step!");
        setScanStatus('warning');
      } else {
        // Randomly simulate "Obstacle" for demo purposes if light is okay
        // In a real app, this would use TensorFlow.js object detection
        if (Math.random() > 0.995) { 
          setObstacleWarning("Obstacle Detected Ahead!");
          setScanStatus('warning');
          // Clear warning after 3 seconds
          setTimeout(() => {
            setObstacleWarning(null);
            setScanStatus('scanning');
          }, 3000);
        } else if (!obstacleWarning) {
          setObstacleWarning(null);
          setScanStatus('clear');
        }
      }
    };

    const interval = setInterval(checkFrame, 500); // Check every 500ms
    return () => clearInterval(interval);
  }, [cameraReady, safetyGuardEnabled, obstacleWarning]);


  // --- Camera & Navigation Logic ---
  const startARSession = useCallback(async () => {
    if (showSafetyModal) return;

    setIsNavigating(true);
    try {
      const constraints = {
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
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

  useEffect(() => {
    if (!showSafetyModal && !stream) startARSession();
  }, [showSafetyModal, stream, startARSession]);

  const stopCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setCameraReady(false);
  }, [stream]);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  // Simulated Navigation Updates
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

  // --- Visual Components ---
  const getDirectionArrow = () => {
    const arrowStyle = "drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]";
    const labelStyle = "text-white font-bold text-2xl mt-6 bg-black/60 px-6 py-2 rounded-xl backdrop-blur-md shadow-lg border border-white/10";
    
    // ... (Arrow logic from previous step)
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
        {/* Close Button */}
        {!showSafetyModal && (
          <button
            onClick={handleCloseCamera}
            className="absolute top-14 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all active:scale-95 shadow-lg"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Video & AI Canvas */}
        {!cameraError && (
          <>
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-500 ${cameraReady ? 'opacity-100' : 'opacity-0'}`} />
            {/* Hidden canvas for AI processing */}
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
            <Button onClick={startARSession} size="lg" className="w-full h-14 text-lg rounded-xl">Retry</Button>
            <Button variant="ghost" onClick={() => navigate('/home')} className="mt-4 h-14 text-lg">Back</Button>
          </div>
        )}

        {/* Navigation Overlay */}
        {cameraReady && isNavigating && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 pt-14 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4">
              <div className="flex-1 bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-inner">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-white/80 font-semibold uppercase tracking-wider mb-0.5">Navigating To</p>
                  <p className="text-white font-bold text-lg truncate">{destination?.name || 'Destination'}</p>
                </div>
              </div>
              
              {/* Safety Toggle */}
              <button
                onClick={() => setSafetyGuardEnabled(!safetyGuardEnabled)}
                className={`w-14 h-14 rounded-2xl backdrop-blur-md border flex items-center justify-center pointer-events-auto active:scale-95 transition-all ${safetyGuardEnabled ? 'bg-primary/80 border-primary text-white' : 'bg-black/50 border-white/20 text-white/50'}`}
              >
                <Shield className="w-6 h-6" />
              </button>
            </div>

            {/* Arrows */}
            <div className="absolute inset-0 flex items-center justify-center pb-20">{getDirectionArrow()}</div>

            {/* Bottom Card */}
            <div className="absolute bottom-28 left-6 right-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 text-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full"><MapPin className="w-6 h-6 text-blue-600" /></div>
                    <div>
                      <span className="block text-3xl font-bold tabular-nums">{distanceToNext}<span className="text-lg font-medium text-slate-500 ml-1">m</span></span>
                      <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Distance</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-bold">{estimatedTime}</span>
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">ETA</span>
                  </div>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out relative" style={{ width: `${100 - (distanceToNext / 25 * 100)}%` }} />
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