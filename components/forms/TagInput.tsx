


import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
    const { themeConfig } = useTheme();
    const [inputValue, setInputValue] = useState('');
    const maxTags = 5;

    const handleAddTag = () => {
        if (inputValue && tags.length < maxTags && !tags.includes(inputValue)) {
            setTags([...tags, inputValue.trim()]);
            setInputValue('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length < maxTags ? "Add a tag..." : `Max ${maxTags} tags`}
                    disabled={tags.length >= maxTags}
                    className={`flex-grow p-3.5 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border-2 border-transparent focus:border-accent`}
                />
                <button 
                    onClick={handleAddTag} 
                    disabled={tags.length >= maxTags || !inputValue}
                    className={`px-4 rounded-xl font-semibold ${themeConfig.textColor} bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
                {tags.map(tag => (
                    <div key={tag} className={`flex items-center space-x-2 py-1 px-3 rounded-full text-sm font-medium ${themeConfig.subtextColor} border border-white/10`}>
                        <span>{tag}</span>
                        <button onClick={() => handleRemoveTag(tag)} className="text-lg leading-none">&times;</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TagInput;