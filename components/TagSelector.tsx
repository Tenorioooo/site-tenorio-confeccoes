// components/TagSelector.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';

interface TagSelectorProps {
  /** List of available category names */
  options: string[];
  /** Currently selected category names */
  selected: string[];
  /** Callback when selection changes */
  onChange: (selected: string[]) => void;
}

/**
 * A premium multi‑select UI rendered as clickable "pills".
 * - Click a pill to toggle selection.
 * - Selected pills have a blue background with a subtle glow.
 * - Unselected pills have a dark translucent background.
 * - Animations use CSS transitions for smooth scaling.
 */
export default function TagSelector({ options, selected, onChange }: TagSelectorProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 
              ${selected.includes(opt) ? 'bg-blue-500 text-white shadow-md hover:bg-blue-400' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}
              ${selected.includes(opt) ? 'scale-105' : 'scale-100'}`}
          >
            {opt}
          </button>
        ))}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 px-2.5 py-0.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            title="Limpar seleção"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
