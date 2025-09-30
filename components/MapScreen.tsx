// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import { Icon } from '@iconify/react';
import Card from './ui/Card';
import {} from '../types';
import jsQR from 'jsqr';

interface POI {
  id: string;
  name: string;
  description: string;
  cx: string;
  cy: string;
  color: string;
}

const pointsOfInterest: POI[] = [
  { id: 'temple', name: 'Main Temple (Darshan)', description: 'Queue starts here for the main deity darshan.', cx: '50%', cy: '35%', color: 'bg-blue-500' },
  { id: 'prasad', name: 'Prasad Counter', description: 'Collect blessed food offerings after your darshan.', cx: '75%', cy: '50%', color: 'bg-green-500' },
  { id: 'cloak', name: 'Cloak Room & Shoe Stand', description: 'Securely store your belongings and footwear.', cx: '25%', cy: '50%', color: 'bg-yellow-500' },
  { id: 'firstaid', name: 'First Aid Center', description: 'Medical assistance available 24/7.', cx: '50%', cy: '75%', color: 'bg-red-500' },
  { id: 'entrance', name: 'Main Entrance (Gate 1)', description: 'Primary entry and security check point.', cx: '50%', cy: '90%', color: 'bg-gray-500' },
];

interface MapScreenProps {
  highlightPOI: string | null;
  onHighlightDone: () => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ highlightPOI, onHighlightDone }) => {
  const [selectedPOI, setSelectedPOI] = React.useState<POI | null>(pointsOfInterest[0]);
  const [cameraMode, setCameraMode] = React.useState<'live' | 'qr' | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [mapNotification, setMapNotification] = React.useState<{type: 'error' | 'success', message: string} | null>(null);
  const [mapTransform, setMapTransform] = React.useState({ x: 0, y: 0, scale: 1 });
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [liveStats, setLiveStats] = React.useState({
    totalVisitors: 1247,
    avgDensity: 72,
    lastUpdated: new Date()
  });

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const animationFrameId = React.useRef<number | null>(null);
  const isCameraOpen = cameraMode !== null;


  React.useEffect(() => {
    if (highlightPOI) {
      const poiToSelect = pointsOfInterest.find(p => p.id === highlightPOI);
      if (poiToSelect) {
        setSelectedPOI(poiToSelect);
      }
      onHighlightDone(); // Reset the highlight trigger
    }
  }, [highlightPOI, onHighlightDone]);

  // Real-time stats updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => {
        const now = new Date();
        const hour = now.getHours();
        
        // Time-based visitor count variations
        const baseVisitors = 1200;
        const timeMultiplier = (hour >= 10 && hour <= 14) || (hour >= 17 && hour <= 20) ? 1.3 : 
                              (hour >= 2 && hour <= 6) ? 0.4 : 0.9;
        
        const newVisitors = Math.max(800, Math.min(1800, 
          baseVisitors * timeMultiplier + (Math.random() - 0.5) * 150
        ));
        
        // Average density based on time and random factors
        const baseDensity = timeMultiplier > 1.2 ? 75 : timeMultiplier < 0.5 ? 35 : 60;
        const newDensity = Math.max(25, Math.min(95, 
          baseDensity + (Math.random() - 0.5) * 20
        ));
        
        return {
          totalVisitors: Math.round(newVisitors),
          avgDensity: Math.round(newDensity),
          lastUpdated: new Date()
        };
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (mapNotification) {
      const timer = setTimeout(() => setMapNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mapNotification]);


  const scanQRCode = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      
      if (context) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
          try {
            const data = JSON.parse(code.data);
            if (data.app === 'PilgrimPath' && data.poiId) {
              const poi = pointsOfInterest.find(p => p.id === data.poiId);
              if (poi) {
                setSelectedPOI(poi);
                setMapNotification({ type: 'success', message: `QR Scanned! Navigating to ${poi.name}.` });
                setCameraMode(null);
              } else { throw new Error('POI not found.'); }
            } else { throw new Error('Invalid QR code format.'); }
          } catch (e) {
            setMapNotification({ type: 'error', message: 'Invalid QR Code. Please scan a valid Pilgrim Path QR code.' });
            setCameraMode(null);
          }
          return; // Stop scanning
        }
      }
    }
    // Continue scanning in the next frame
    if (cameraMode === 'qr' && animationFrameId.current !== null) {
      animationFrameId.current = requestAnimationFrame(scanQRCode);
    }
  };


  const startCamera = async () => {
    setCameraError(null);
    setMapNotification(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             if (cameraMode === 'qr') {
               animationFrameId.current = requestAnimationFrame(scanQRCode);
             }
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        let errorMessage = "Could not access the camera. It may be in use by another application.";
        if (err instanceof Error) {
            if (err.name === 'NotAllowedError') errorMessage = "Camera access was denied. Please enable it in browser settings.";
            else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') errorMessage = "No camera was found on your device.";
        }
        setCameraError(errorMessage);
        setCameraMode(null);
      }
    } else {
      setCameraError("Your browser does not support camera access.");
      setCameraMode(null);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
  };
  
  React.useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraOpen, cameraMode]);


  const resetMapView = () => {
    setIsAnimating(true);
    
    const startTransform = { ...mapTransform };
    const endTransform = { x: 0, y: 0, scale: 1 };
    
    const duration = 600; // ms
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      const currentTransform = {
        x: startTransform.x + (endTransform.x - startTransform.x) * easedProgress,
        y: startTransform.y + (endTransform.y - startTransform.y) * easedProgress,
        scale: startTransform.scale + (endTransform.scale - startTransform.scale) * easedProgress
      };
      
      setMapTransform(currentTransform);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const handleSelectPOI = (poi: POI) => {
    if (selectedPOI?.id === poi.id) return; // Don't animate if already selected
    
    setSelectedPOI(poi);
    setIsAnimating(true);
    
    // Calculate POI position in SVG coordinates (0-100)
    const poiX = parseFloat(poi.cx.replace('%', ''));
    const poiY = parseFloat(poi.cy.replace('%', ''));
    
    // Calculate transform to center the POI
    // We want to zoom in slightly and center the POI
    const targetScale = 1.5;
    const centerX = 50; // SVG center
    const centerY = 50;
    
    // Calculate translation needed to center the POI
    const targetX = centerX - (poiX * targetScale);
    const targetY = centerY - (poiY * targetScale);
    
    // Animate the transform
    const startTransform = { ...mapTransform };
    const endTransform = { x: targetX, y: targetY, scale: targetScale };
    
    const duration = 800; // ms
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      const currentTransform = {
        x: startTransform.x + (endTransform.x - startTransform.x) * easedProgress,
        y: startTransform.y + (endTransform.y - startTransform.y) * easedProgress,
        scale: startTransform.scale + (endTransform.scale - startTransform.scale) * easedProgress
      };
      
      setMapTransform(currentTransform);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Icon icon="material-symbols:map" className="text-2xl sm:text-3xl" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Temple Complex Map</h1>
              <p className="text-orange-100 text-sm">Navigate the sacred grounds with ease</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <style>{`
        .poi-pulse { animation: poi-pulse 2s infinite ease-in-out; }
        @keyframes poi-pulse { 
          0% { transform: scale(1); opacity: 0.7; } 
          50% { transform: scale(1.4); opacity: 0.4; } 
          100% { transform: scale(1); opacity: 0.7; } 
        }
        .poi-selected { animation: poi-selected 0.6s ease-out; }
        @keyframes poi-selected {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1.1); }
        }
        .poi-glow { filter: drop-shadow(0 0 6px currentColor); }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-camera-fade-in { animation: camera-fade-in 0.3s ease-out forwards; }
        @keyframes camera-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <h2 className="text-lg sm:text-xl font-bold text-gray-700">Temple Complex Map</h2>
      {cameraError && (
        <Card className="bg-red-50 border-l-4 border-red-400">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Icon icon="material-symbols:videocam-off" className="text-red-600 text-base sm:text-lg" />
              <p className="text-xs sm:text-sm text-red-800 font-semibold">{cameraError}</p>
            </div>
        </Card>
      )}
      {mapNotification && (
        <Card className={mapNotification.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'}>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Icon icon={mapNotification.type === 'success' ? "material-symbols:check-circle" : "material-symbols:error"} className={mapNotification.type === 'success' ? 'text-base sm:text-lg text-green-600' : 'text-base sm:text-lg text-red-600'} />
              <p className={`text-xs sm:text-sm font-semibold ${mapNotification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{mapNotification.message}</p>
            </div>
        </Card>
      )}

      <Card>
        <div className="relative bg-gray-100 h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="hidden"></canvas>
          {isCameraOpen && (
            <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center animate-camera-fade-in">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="w-full h-full object-cover"
              ></video>

              {cameraMode === 'qr' && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                      <div className="w-48 sm:w-64 h-48 sm:h-64 border-4 border-white/80 rounded-lg shadow-lg" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}></div>
                      <p className="mt-2 sm:mt-4 text-white font-semibold text-center text-xs sm:text-sm px-4">Align QR code within the frame</p>
                  </div>
              )}

              <button 
                  onClick={() => setCameraMode(null)}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30 bg-black/40 backdrop-blur-sm text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Close"
                >
                  <Icon icon="material-symbols:close" className="text-lg sm:text-2xl" />
              </button>
            </div>
          )}

          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className={isCameraOpen ? 'invisible' : ''}
            style={{
              transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
              transformOrigin: 'center',
              transition: isAnimating ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            <path d="M50 90 V 75 H 25 V 50 H 50 V 35" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="4" />
            <path d="M50 75 H 75 V 50 H 50" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="4" />
            {pointsOfInterest.map(poi => (
              <g key={poi.id} onClick={() => handleSelectPOI(poi)} className="cursor-pointer">
                <circle 
                  cx={poi.cx} 
                  cy={poi.cy} 
                  r={selectedPOI?.id === poi.id ? 4 : 3} 
                  className={`${poi.color.replace('bg-','fill-')} transition-all duration-300 ${
                    selectedPOI?.id === poi.id ? 'poi-selected poi-glow' : 'hover:scale-110'
                  }`}
                />
                {selectedPOI?.id === poi.id && (
                  <>
                    <circle 
                      cx={poi.cx} 
                      cy={poi.cy} 
                      r="8" 
                      className={`${poi.color.replace('bg-','fill-')} opacity-30 poi-pulse`}
                    />
                    <circle 
                      cx={poi.cx} 
                      cy={poi.cy} 
                      r="12" 
                      className={`${poi.color.replace('bg-','stroke-')} opacity-20 poi-pulse`}
                      fill="none"
                      strokeWidth="1"
                      style={{ animationDelay: '0.5s' }}
                    />
                  </>
                )}
              </g>
            ))}
          </svg>
           {selectedPOI && !isCameraOpen && (
            <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 bg-white/80 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-md transition-all animate-fade-in-up">
              <h4 className="font-bold text-gray-800 text-xs sm:text-sm">{selectedPOI.name}</h4>
              <p className="text-xs text-gray-600">{selectedPOI.description}</p>
            </div>
          )}
          
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-0 flex flex-col space-y-1 sm:space-y-2">
            {mapTransform.scale > 1 && (
              <button 
                onClick={resetMapView}
                className="bg-white/80 backdrop-blur-sm text-gray-800 p-1.5 sm:p-2.5 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Reset Map View"
              >
                <Icon icon="solar:home-bold-duotone" className="text-lg sm:text-2xl" />
              </button>
            )}
            <button 
              onClick={() => setCameraMode('live')}
              className="bg-white/80 backdrop-blur-sm text-gray-800 p-1.5 sm:p-2.5 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              aria-label="Open Live View"
            >
              <Icon icon="solar:camera-bold-duotone" className="text-lg sm:text-2xl" />
            </button>
            <button 
              onClick={() => setCameraMode('qr')}
              className="bg-white/80 backdrop-blur-sm text-gray-800 p-1.5 sm:p-2.5 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              aria-label="Scan QR Code"
            >
               <Icon icon="solar:qr-code-bold-duotone" className="text-lg sm:text-2xl" />
            </button>
          </div>
        </div>
      </Card>

      {/* Real-time Crowd Status Section */}
      <Card>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-orange-100 rounded-full">
              <Icon icon="solar:users-group-rounded-bold-duotone" className="text-orange-600 text-base sm:text-lg" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Live Temple Status</h3>
              <p className="text-xs sm:text-sm text-gray-500">Real-time crowd monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-green-100 text-green-700">
            <Icon icon="solar:check-circle-bold" className="text-xs sm:text-sm" />
            <span>Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-700">Total Visitors</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-800">{liveStats.totalVisitors.toLocaleString()}</p>
              </div>
              <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-2xl sm:text-3xl text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-amber-700">Avg Density</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-800">{liveStats.avgDensity}%</p>
              </div>
              <Icon icon="solar:chart-square-bold-duotone" className="text-2xl sm:text-3xl text-amber-600" />
            </div>
          </div>
        </div>

        {selectedPOI && (
          <div className="border-t border-gray-100 pt-3 sm:pt-4">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
              <Icon icon="solar:map-point-bold-duotone" className="mr-1 sm:mr-2 text-gray-500 text-sm sm:text-base" />
              {selectedPOI.name} Status
            </h4>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-gray-600">Current Density</span>
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  {Math.max(20, Math.min(95, liveStats.avgDensity + (Math.random() - 0.5) * 30))}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-amber-600 h-1.5 sm:h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.max(20, Math.min(95, liveStats.avgDensity + (Math.random() - 0.5) * 30))}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                {(() => {
                  const density = Math.max(20, Math.min(95, liveStats.avgDensity + (Math.random() - 0.5) * 30));
                  if (density >= 80) return 'High density - Consider waiting';
                  if (density >= 60) return 'Moderate crowd - Normal wait times';
                  if (density >= 40) return 'Light crowd - Good time to visit';
                  return 'Very light - Excellent conditions';
                })()}
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3 sm:pt-4 mt-3 sm:mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last updated: {liveStats.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="flex items-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
              Updating every 30s
            </span>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default MapScreen;