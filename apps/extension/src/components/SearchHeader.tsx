import React, { useState } from 'react';
import { Search, ChevronDown, Settings } from 'lucide-react';

interface SearchHeaderProps {
    onSearch: (query: string) => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onSearch(val);
    };

    return (
        <header className="p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tighter">
                        <span className="text-utsa-orange">UTSA</span>
                        <span className="text-white ml-1">Reg+</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-utsa-orange flex items-center justify-center text-[10px] font-bold">JS</div>
                        <span className="text-[10px] font-medium text-white/80">J. Smith</span>
                    </div>
                    <button className="text-white/60 hover:text-utsa-orange transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-white/40 group-focus-within:text-utsa-orange transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder="Search CRN, Class Name, or Dept..."
                    className="w-full glass-input py-3 pl-10 pr-10 rounded-xl text-sm placeholder:text-white/20"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                    <ChevronDown className="w-4 h-4 text-white/40" />
                </div>
            </div>
        </header>
    );
};

export default SearchHeader;
