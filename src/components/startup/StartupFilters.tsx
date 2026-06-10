'use client';

import React from 'react';
import { StartupFilters as IStartupFilters, StartupStage, AcquisitionStatus } from '@/services/startupService';
import {
  STARTUP_STAGES,
  STARTUP_CATEGORIES,
} from '@/data/startupTaxonomy';
import { cn } from '@/utils/cn';

interface StartupFiltersProps {
  filters: IStartupFilters;
  onChange: (filters: IStartupFilters) => void;
}

const StartupFilters: React.FC<StartupFiltersProps> = ({ filters, onChange }) => {
  const handleToggle = (key: keyof IStartupFilters, value: any) => {
    const current = (filters[key] as any[]) || [];
    const updated = current.includes(value)
      ? current.filter((v: any) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const handleBooleanToggle = (key: 'isRaising' | 'acquisitionStatus', value: any) => {
      const newValue = filters[key] === value ? undefined : value;
      onChange({ ...filters, [key]: newValue });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const resetFilters = () => {
    onChange({});
  };

  return (
    <div className="space-y-8 bg-[#0A0A0A] p-8 border border-white/5 rounded-[30px] sticky top-[150px]">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold text-white">Filters</h3>
        <button 
            onClick={resetFilters}
            className="text-xs text-white/40 hover:text-primary-500 uppercase tracking-widest font-bold transition-colors"
        >
            Reset All
        </button>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <label className="text-xs text-white/40 uppercase tracking-widest font-bold ml-1">Search</label>
        <div className="relative">
            <input
                type="text"
                value={filters.search || ''}
                onChange={handleSearch}
                placeholder="Name or keyword..."
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/20 absolute right-6 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <label className="text-xs text-white/40 uppercase tracking-widest font-bold ml-1">Categories</label>
        <div className="flex flex-wrap gap-2">
            {STARTUP_CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => handleToggle('category', cat)}
                    className={cn(
                        "px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
                        filters.category?.includes(cat)
                            ? "bg-primary-500/10 border-primary-500 text-primary-500"
                            : "bg-black border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                    )}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-3">
        <label className="text-xs text-white/40 uppercase tracking-widest font-bold ml-1">Stage</label>
        <div className="flex flex-wrap gap-2">
            {STARTUP_STAGES.map(stage => (
                <button
                    key={stage}
                    onClick={() => handleToggle('stage', stage)}
                    className={cn(
                        "px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
                        filters.stage?.includes(stage)
                            ? "bg-white/10 border-white/30 text-white"
                            : "bg-black border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                    )}
                >
                    {stage}
                </button>
            ))}
        </div>
      </div>

      {/* Market Signals */}
      <div className="space-y-4 pt-2">
        <button
            onClick={() => handleBooleanToggle('isRaising', true)}
            className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                filters.isRaising === true
                    ? "bg-[#14F195]/10 border-[#14F195]/40 text-[#14F195]"
                    : "bg-black border-white/5 text-white/40 hover:border-white/10"
            )}
        >
            <span className="text-sm font-bold uppercase tracking-widest">Raising Funds</span>
            <div className={cn("w-2 h-2 rounded-full", filters.isRaising === true ? "bg-[#14F195] animate-pulse" : "bg-white/10")} />
        </button>

        <button
            onClick={() => handleBooleanToggle('acquisitionStatus', 'open_to_discuss')}
            className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                filters.acquisitionStatus === 'open_to_discuss'
                    ? "bg-[#9945FF]/10 border-[#9945FF]/40 text-[#9945FF]"
                    : "bg-black border-white/5 text-white/40 hover:border-white/10"
            )}
        >
            <span className="text-sm font-bold uppercase tracking-widest">Open to Acquisition</span>
            <div className={cn("w-2 h-2 rounded-full", filters.acquisitionStatus === 'open_to_discuss' ? "bg-[#9945FF] animate-pulse" : "bg-white/10")} />
        </button>
      </div>
    </div>
  );
};

export default StartupFilters;
