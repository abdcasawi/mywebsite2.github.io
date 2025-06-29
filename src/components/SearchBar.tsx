import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search channels..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative max-w-md">
      <div className={`
        relative flex items-center bg-gray-800 rounded-xl border transition-all duration-200
        ${isFocused ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-600'}
      `}>
        <Search className="absolute left-4 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-transparent text-white placeholder-gray-400 outline-none"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}