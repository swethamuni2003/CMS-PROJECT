import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Palette, Check } from 'lucide-react';

const ThemeSwitcher = () => {
    const { isDark, toggleDarkMode, paletteId, changePalette, palettes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            {/* Quick Dark/Light Toggle */}
            <button
                onClick={toggleDarkMode}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/80 active:scale-95"
            >
                {isDark ? (
                    <Sun size={19} className="text-amber-400 animate-spin-slow transition-transform" />
                ) : (
                    <Moon size={19} className="text-slate-600 transition-transform" />
                )}
            </button>

            {/* Palette Picker Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="Change Color Theme"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/80 active:scale-95"
            >
                <Palette size={19} className="text-primary-600" />
            </button>

            {/* Palette Dropdown Popover */}
            {isOpen && (
                <div className="absolute right-0 top-12 z-50 w-60 p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                        Accent Themes
                    </div>
                    <div className="space-y-1.5">
                        {Object.values(palettes).map((p) => {
                            const isSelected = paletteId === p.id;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        changePalette(p.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                        isSelected
                                            ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className="w-4 h-4 rounded-full shadow-sm flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
                                            style={{ backgroundColor: p.colorHex }}
                                        />
                                        <span>{p.name}</span>
                                    </div>
                                    {isSelected && <Check size={16} className="text-primary-600" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
