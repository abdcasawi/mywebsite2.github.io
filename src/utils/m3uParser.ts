import { Channel, M3UPlaylist } from '../types';

export class M3UParser {
  static parseM3U(content: string): M3UPlaylist {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const channels: Channel[] = [];
    const categories = new Set<string>();
    
    let currentChannel: Partial<Channel> = {};
    let channelIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('#EXTINF:')) {
        // Parse EXTINF line
        const extinf = this.parseExtinf(line);
        currentChannel = {
          id: `channel_${channelIndex++}`,
          name: extinf.title || `Channel ${channelIndex}`,
          description: extinf.title || '',
          category: extinf.groupTitle || 'General',
          language: 'Unknown',
          country: 'Unknown',
          isHD: extinf.title?.toLowerCase().includes('hd') || false,
          isFavorite: false,
          logo: extinf.tvgLogo || this.getDefaultLogo(extinf.groupTitle || 'General'),
          groupTitle: extinf.groupTitle,
          tvgId: extinf.tvgId,
          tvgName: extinf.tvgName,
          tvgLogo: extinf.tvgLogo,
          radioStation: extinf.radio || false
        };
        
        if (extinf.groupTitle) {
          categories.add(extinf.groupTitle);
        }
      } else if (line.startsWith('http') || line.startsWith('rtmp') || line.startsWith('rtsp')) {
        // This is a stream URL
        if (currentChannel.name) {
          currentChannel.streamUrl = line;
          channels.push(currentChannel as Channel);
          currentChannel = {};
        }
      }
    }

    return {
      channels,
      metadata: {
        totalChannels: channels.length,
        categories: Array.from(categories)
      }
    };
  }

  private static parseExtinf(line: string): any {
    const result: any = {};
    
    // Extract the title (everything after the last comma)
    const lastCommaIndex = line.lastIndexOf(',');
    if (lastCommaIndex !== -1) {
      result.title = line.substring(lastCommaIndex + 1).trim();
    }

    // Extract attributes
    const attributeRegex = /(\w+)="([^"]*)"/g;
    let match;
    
    while ((match = attributeRegex.exec(line)) !== null) {
      const [, key, value] = match;
      switch (key.toLowerCase()) {
        case 'tvg-id':
          result.tvgId = value;
          break;
        case 'tvg-name':
          result.tvgName = value;
          break;
        case 'tvg-logo':
          result.tvgLogo = value;
          break;
        case 'group-title':
          result.groupTitle = value;
          break;
        case 'radio':
          result.radio = value.toLowerCase() === 'true';
          break;
      }
    }

    return result;
  }

  private static getDefaultLogo(category: string): string {
    const logoMap: { [key: string]: string } = {
      'news': 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      'sports': 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      'entertainment': 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      'movies': 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      'music': 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      'kids': 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    };
    
    const categoryLower = category.toLowerCase();
    for (const [key, logo] of Object.entries(logoMap)) {
      if (categoryLower.includes(key)) {
        return logo;
      }
    }
    
    return 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2';
  }

  static async loadM3UFromUrl(url: string): Promise<M3UPlaylist> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch M3U: ${response.statusText}`);
      }
      const content = await response.text();
      return this.parseM3U(content);
    } catch (error) {
      console.error('Error loading M3U from URL:', error);
      throw error;
    }
  }

  static parseM3UFile(file: File): Promise<M3UPlaylist> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const playlist = this.parseM3U(content);
          resolve(playlist);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}