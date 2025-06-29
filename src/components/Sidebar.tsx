import React from 'react';
import { 
  Tv, 
  Search, 
  Heart, 
  Clock, 
  Settings, 
  Newspaper, 
  Trophy, 
  Star, 
  Film,
  Menu,
  X
} from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const categoryIcons: { [key: string]: React.ElementType } = {
  Tv,
  Newspaper,
  Trophy,
  Star,
  Film,
};

export default function Sidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  isOpen, 
  onToggle 
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 
        backdrop-blur-lg border-r border-gray-700 z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 mt-8 lg:mt-0">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Tv className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">StreamTV</h1>
              <p className="text-gray-400 text-sm">Live IPTV</p>
            </div>
          </div>

          <nav className="space-y-2">
            <div className="mb-6">
              <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">
                Browse
              </h3>
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.icon];
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategorySelect(category.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${selectedCategory === category.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <IconComponent size={20} />
                    <span className="font-medium">{category.name}</span>
                    <span className="ml-auto text-xs bg-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">
                Library
              </h3>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <Heart size={20} />
                <span className="font-medium">Favorites</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <Clock size={20} />
                <span className="font-medium">Recently Watched</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <Settings size={20} />
                <span className="font-medium">Settings</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}