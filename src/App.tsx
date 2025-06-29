import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import ChannelGrid from './components/ChannelGrid';
import VideoPlayer from './components/VideoPlayer';
import EPGGuide from './components/EPGGuide';
import M3ULoader from './components/M3ULoader';
import { channels as initialChannels, categories as initialCategories, programs } from './data/mockData';
import { Channel, Category, M3UPlaylist } from './types';
import { Upload } from 'lucide-react';

function App() {
  const [channels, setChannels] = useState(initialChannels);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showM3ULoader, setShowM3ULoader] = useState(false);

  const filteredChannels = useMemo(() => {
    let filtered = channels;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(channel => channel.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [channels, selectedCategory, searchQuery]);

  const currentProgram = useMemo(() => {
    if (!selectedChannel) return null;
    return programs.find(p => 
      p.channelId === selectedChannel.id && 
      new Date() >= p.startTime && 
      new Date() <= p.endTime
    ) || null;
  }, [selectedChannel]);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setSidebarOpen(false);
  };

  const handleToggleFavorite = (channelId: string) => {
    setChannels(prev => prev.map(channel =>
      channel.id === channelId
        ? { ...channel, isFavorite: !channel.isFavorite }
        : channel
    ));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSidebarOpen(false);
  };

  const handlePlaylistLoad = (playlist: M3UPlaylist) => {
    // Update channels with loaded playlist
    setChannels(playlist.channels);
    
    // Update categories based on loaded channels
    const newCategories: Category[] = [
      { id: 'all', name: 'All Channels', icon: 'Tv', count: playlist.channels.length }
    ];
    
    const categoryMap = new Map<string, number>();
    playlist.channels.forEach(channel => {
      const category = channel.category.toLowerCase();
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    // Add categories with appropriate icons
    const iconMap: { [key: string]: string } = {
      'news': 'Newspaper',
      'sports': 'Trophy',
      'entertainment': 'Star',
      'movies': 'Film',
      'music': 'Music',
      'kids': 'Baby'
    };
    
    categoryMap.forEach((count, category) => {
      let icon = 'Tv';
      for (const [key, iconName] of Object.entries(iconMap)) {
        if (category.includes(key)) {
          icon = iconName;
          break;
        }
      }
      
      newCategories.push({
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        icon,
        count
      });
    });
    
    setCategories(newCategories);
    setSelectedCategory('all');
    setShowM3ULoader(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex">
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 lg:ml-0">
          {/* Header */}
          <header className="p-6 lg:pl-8 border-b border-gray-700 bg-gray-800/50 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="ml-12 lg:ml-0">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {selectedCategory === 'all' ? 'All Channels' : 
                   categories.find(c => c.id === selectedCategory)?.name || 'Channels'}
                </h1>
                <p className="text-gray-400">
                  {filteredChannels.length} channels available
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowM3ULoader(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Upload size={16} />
                  Load M3U
                </button>
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="Search channels, shows..."
                />
              </div>
            </div>
          </header>

          <div className="p-6 lg:pl-8">
            {/* Video Player Section */}
            <div className="mb-8">
              <VideoPlayer
                channel={selectedChannel}
                currentProgram={currentProgram}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Channel Grid */}
              <div className="xl:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Browse Channels
                  </h2>
                  {searchQuery && (
                    <p className="text-gray-400 text-sm">
                      {filteredChannels.length} results for "{searchQuery}"
                    </p>
                  )}
                </div>
                
                {filteredChannels.length > 0 ? (
                  <ChannelGrid
                    channels={filteredChannels}
                    selectedChannel={selectedChannel}
                    onChannelSelect={handleChannelSelect}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">No channels found</div>
                    <p className="text-gray-500 text-sm mb-6">
                      Try adjusting your search or browse different categories
                    </p>
                    <button
                      onClick={() => setShowM3ULoader(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Upload size={20} />
                      Load M3U Playlist
                    </button>
                  </div>
                )}
              </div>

              {/* EPG Guide */}
              <div className="xl:col-span-1">
                <EPGGuide
                  programs={programs}
                  selectedChannelId={selectedChannel?.id || null}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* M3U Loader Modal */}
      {showM3ULoader && (
        <M3ULoader
          onPlaylistLoad={handlePlaylistLoad}
          onClose={() => setShowM3ULoader(false)}
        />
      )}
    </div>
  );
}

export default App;