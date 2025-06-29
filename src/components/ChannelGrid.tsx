import React from 'react';
import { Heart, Wifi, WifiOff, BedIcon as HdIcon } from 'lucide-react';
import { Channel } from '../types';

interface ChannelGridProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

export default function ChannelGrid({ 
  channels, 
  selectedChannel, 
  onChannelSelect, 
  onToggleFavorite 
}: ChannelGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {channels.map((channel) => (
        <div
          key={channel.id}
          className={`
            relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform
            ${selectedChannel?.id === channel.id 
              ? 'ring-2 ring-blue-500 scale-105 shadow-xl shadow-blue-500/25' 
              : 'hover:scale-105 hover:shadow-xl'
            }
          `}
          onClick={() => onChannelSelect(channel)}
        >
          <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Channel info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white text-sm font-semibold truncate mb-1">
                {channel.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">{channel.language}</span>
                {channel.isHD && (
                  <div className="flex items-center gap-1">
                    <HdIcon size={12} className="text-blue-400" />
                    <span className="text-xs text-blue-400">HD</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="absolute top-2 left-2">
              <div className="flex items-center gap-1">
                <Wifi size={12} className="text-green-400" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
            
            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(channel.id);
              }}
              className={`
                absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200
                ${channel.isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-black/40 text-gray-300 hover:bg-red-500 hover:text-white'
                }
                opacity-0 group-hover:opacity-100
              `}
            >
              <Heart 
                size={12} 
                className={channel.isFavorite ? 'fill-current' : ''} 
              />
            </button>
          </div>
          
          {/* Channel description on hover */}
          <div className="absolute inset-x-0 top-full group-hover:top-0 bg-black/90 p-3 transition-all duration-300 opacity-0 group-hover:opacity-100">
            <h3 className="text-white font-semibold mb-2">{channel.name}</h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              {channel.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                {channel.category}
              </span>
              <span className="text-xs text-gray-400">{channel.country}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}