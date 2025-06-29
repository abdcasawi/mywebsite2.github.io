export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  streamUrl: string;
  description: string;
  language: string;
  country: string;
  isHD: boolean;
  isFavorite?: boolean;
  groupTitle?: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  radioStation?: boolean;
}

export interface Program {
  id: string;
  channelId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  genre: string;
  rating?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface M3UPlaylist {
  channels: Channel[];
  metadata: {
    title?: string;
    description?: string;
    totalChannels: number;
    categories: string[];
  };
}

export interface StreamQuality {
  label: string;
  url: string;
  bandwidth?: number;
  resolution?: string;
}