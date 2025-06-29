import React, { useState } from 'react';
import { Upload, Link, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { M3UParser } from '../utils/m3uParser';
import { M3UPlaylist } from '../types';

interface M3ULoaderProps {
  onPlaylistLoad: (playlist: M3UPlaylist) => void;
  onClose: () => void;
}

export default function M3ULoader({ onPlaylistLoad, onClose }: M3ULoaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const playlist = await M3UParser.loadM3UFromUrl(urlInput);
      onPlaylistLoad(playlist);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.m3u') && !file.name.toLowerCase().endsWith('.m3u8')) {
      setError('Please select a valid M3U or M3U8 file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const playlist = await M3UParser.parseM3UFile(file);
      onPlaylistLoad(playlist);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse M3U file');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {success ? (
              <CheckCircle className="text-white" size={32} />
            ) : (
              <Upload className="text-white" size={32} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {success ? 'Playlist Loaded!' : 'Load M3U Playlist'}
          </h2>
          <p className="text-gray-400">
            {success 
              ? 'Your channels have been loaded successfully' 
              : 'Upload an M3U file or enter a URL to load your IPTV channels'
            }
          </p>
        </div>

        {!success && (
          <>
            {/* URL Input */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">
                Load from URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/playlist.m3u"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  disabled={loading}
                />
                <button
                  onClick={handleUrlLoad}
                  disabled={loading || !urlInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading ? <Loader className="animate-spin" size={16} /> : <Link size={16} />}
                  Load
                </button>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">or</span>
              </div>
            </div>

            {/* File Upload */}
            <div
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                ${dragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
                }
                ${loading ? 'opacity-50 pointer-events-none' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".m3u,.m3u8"
                onChange={handleFileInputChange}
                className="hidden"
                id="m3u-file-input"
                disabled={loading}
              />
              <label
                htmlFor="m3u-file-input"
                className="cursor-pointer block"
              >
                {loading ? (
                  <Loader className="mx-auto text-blue-500 animate-spin mb-4" size={32} />
                ) : (
                  <Upload className="mx-auto text-gray-400 mb-4" size={32} />
                )}
                <p className="text-white font-medium mb-2">
                  {loading ? 'Processing...' : 'Drop your M3U file here'}
                </p>
                <p className="text-gray-400 text-sm">
                  {loading ? 'Please wait while we load your playlist' : 'or click to browse files'}
                </p>
              </label>
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
            <p className="text-green-300 text-sm">Playlist loaded successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}