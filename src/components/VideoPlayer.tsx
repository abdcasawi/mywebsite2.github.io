import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  Info,
  Heart,
  SkipBack,
  SkipForward,
  AlertCircle,
  Loader
} from 'lucide-react';
import { Channel, Program, StreamQuality } from '../types';
import Hls from 'hls.js';

interface VideoPlayerProps {
  channel: Channel | null;
  currentProgram: Program | null;
  onToggleFavorite: (channelId: string) => void;
}

export default function VideoPlayer({ channel, currentProgram, onToggleFavorite }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<StreamQuality[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<StreamQuality | null>(null);

  useEffect(() => {
    if (channel && videoRef.current) {
      loadStream(channel.streamUrl);
    }
    
    // Cleanup HLS instance on unmount
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying && !showInfo && !showQualityMenu) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, showControls, showInfo, showQualityMenu]);

  const loadStream = async (streamUrl: string) => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    try {
      // Check if it's an HLS stream
      if (streamUrl.includes('.m3u8') || streamUrl.includes('m3u8')) {
        await loadHLSStream(streamUrl);
      } else {
        // Direct stream URL
        videoRef.current.src = streamUrl;
        videoRef.current.load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stream');
      setIsLoading(false);
    }
  };

  const loadHLSStream = async (url: string) => {
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      // Use hls.js for browsers that support it
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
        setIsLoading(false);
        
        // Extract available quality levels
        const levels = hls.levels.map((level, index) => ({
          label: level.height ? `${level.height}p` : `Level ${index}`,
          url: level.url[0] || url,
          bandwidth: level.bitrate,
          resolution: level.height ? `${level.width}x${level.height}` : undefined
        }));
        
        setAvailableQualities(levels);
        if (levels.length > 0) {
          setSelectedQuality(levels[0]);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        
        // Always stop loading indicator for any error
        setIsLoading(false);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error: Unable to load the stream. Please check your internet connection, verify the stream URL is correct, or contact your administrator if CORS restrictions may be blocking the stream.');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error: The stream format is not supported or corrupted. Please try a different stream or contact support.');
              break;
            default:
              setError('An unexpected error occurred while loading the stream. Please try again or contact support.');
              break;
          }
        } else {
          // Handle non-fatal errors that still impact user experience
          switch (data.type) {
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                setError('Playback is stalling due to buffering issues. This may be caused by a slow internet connection or server problems. The stream will attempt to recover automatically.');
              }
              break;
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Non-fatal network errors might still need user attention
              if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR || 
                  data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
                setError('Stream manifest could not be loaded. Please check the stream URL or try again later.');
              }
              break;
          }
        }
      });

    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = url;
      videoRef.current.load();
    } else {
      setError('HLS streams are not supported in this browser. Please try a different stream or use a modern browser.');
      setIsLoading(false);
    }
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setError('Failed to load video stream. Please check the stream URL or try a different channel.');
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setError('Failed to play video. The stream may be unavailable.');
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleQualityChange = (quality: StreamQuality) => {
    if (hlsRef.current && hlsRef.current.levels) {
      const levelIndex = hlsRef.current.levels.findIndex(level => 
        level.height?.toString() === quality.label.replace('p', '')
      );
      if (levelIndex !== -1) {
        hlsRef.current.currentLevel = levelIndex;
        setSelectedQuality(quality);
      }
    }
    setShowQualityMenu(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const retryStream = () => {
    if (channel) {
      loadStream(channel.streamUrl);
    }
  };

  if (!channel) {
    return (
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Play className="text-gray-400" size={32} />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Select a Channel</h3>
          <p className="text-gray-400">Choose a channel from the grid to start watching</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !showInfo && !showQualityMenu && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onClick={togglePlay}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
        onLoadStart={() => setIsLoading(true)}
        onLoadedData={handleVideoLoad}
        onCanPlay={handleVideoLoad}
        onError={handleVideoError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        autoPlay
        playsInline
        crossOrigin="anonymous"
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-center">
            <Loader className="animate-spin text-blue-500 mb-4 mx-auto" size={48} />
            <p className="text-white text-lg">Loading stream...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we connect to the channel</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <AlertCircle className="text-red-500 mb-4 mx-auto" size={48} />
            <h3 className="text-white text-xl font-semibold mb-2">Stream Error</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={retryStream}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channel info overlay */}
      <div className={`
        absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 transition-opacity duration-300
        ${showControls || showInfo ? 'opacity-100' : 'opacity-0'}
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2';
              }}
            />
            <div>
              <h2 className="text-white text-xl font-bold">{channel.name}</h2>
              <p className="text-gray-300 text-sm">{channel.description}</p>
              {currentProgram && (
                <div className="mt-2">
                  <p className="text-blue-400 font-semibold">{currentProgram.title}</p>
                  <p className="text-gray-400 text-sm">{currentProgram.description}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 bg-black/40 rounded-lg hover:bg-black/60 transition-colors"
            >
              <Info className="text-white" size={20} />
            </button>
            <button
              onClick={() => onToggleFavorite(channel.id)}
              className={`
                p-2 rounded-lg transition-colors
                ${channel.isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-black/40 text-white hover:bg-red-500'
                }
              `}
            >
              <Heart size={20} className={channel.isFavorite ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className={`
        absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300
        ${showControls ? 'opacity-100' : 'opacity-0'}
      `}>
        {/* Progress bar for live streams */}
        <div className="mb-4">
          <div className="w-full bg-gray-600 h-1 rounded-full mb-2">
            <div 
              className="bg-red-500 h-1 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-300">
            <span>LIVE</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Broadcasting
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              disabled={isLoading || !!error}
              className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-600"
            >
              {isPlaying ? <Pause className="text-white" size={20} /> : <Play className="text-white" size={20} />}
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isMuted ? <VolumeX className="text-white" size={20} /> : <Volume2 className="text-white" size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-blue-500"
              />
            </div>
            
            <div className="text-white text-sm">
              <span className="bg-red-500 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Settings className="text-white" size={20} />
              </button>
              
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 min-w-[120px]">
                  <div className="p-2">
                    <div className="text-white text-sm font-medium mb-2 px-2">Quality</div>
                    <button 
                      onClick={() => {
                        if (hlsRef.current) {
                          hlsRef.current.currentLevel = -1; // Auto quality
                        }
                        setShowQualityMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 text-sm text-blue-400 hover:bg-gray-700 rounded"
                    >
                      Auto
                    </button>
                    {availableQualities.map((quality, index) => (
                      <button
                        key={index}
                        onClick={() => handleQualityChange(quality)}
                        className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-700 rounded ${
                          selectedQuality?.label === quality.label ? 'text-blue-400' : 'text-gray-300'
                        }`}
                      >
                        {quality.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Maximize className="text-white" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Program info panel */}
      {showInfo && (
        <div className="absolute inset-0 bg-black/80 p-6 flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2';
                }}
              />
              <div>
                <h3 className="text-white text-xl font-bold">{channel.name}</h3>
                <p className="text-gray-400">{channel.category} • {channel.country}</p>
                <div className="flex items-center gap-2 mt-1">
                  {channel.isHD && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">HD</span>
                  )}
                  <span className="text-gray-400 text-sm">{channel.language}</span>
                </div>
              </div>
            </div>
            
            {currentProgram && (
              <div className="mb-4">
                <h4 className="text-blue-400 font-semibold mb-2">Now Playing</h4>
                <p className="text-white font-medium">{currentProgram.title}</p>
                <p className="text-gray-300 text-sm mt-1">{currentProgram.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span>{currentProgram.genre}</span>
                  {currentProgram.rating && <span>{currentProgram.rating}</span>}
                </div>
              </div>
            )}
            
            <div className="mb-4 text-sm text-gray-400">
              <p><strong>Stream URL:</strong> {channel.streamUrl}</p>
              {channel.tvgId && <p><strong>TVG ID:</strong> {channel.tvgId}</p>}
            </div>
            
            <button
              onClick={() => setShowInfo(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}