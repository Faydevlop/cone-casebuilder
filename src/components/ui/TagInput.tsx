import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
  hint?: string;
}

export function TagInput({ label, tags, onChange, placeholder = 'Add and press Enter...', id, hint }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  function addTag(value: string) {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div
        className="tag-input-container"
        onClick={() => document.getElementById(id ?? 'tag-input')?.focus()}
      >
        {tags.map((tag, i) => (
          <span key={tag} className="tag-pill">
            {tag}
            <button
              type="button"
              className="tag-remove-btn"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id ?? 'tag-input'}
          className="tag-input-field"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputValue) addTag(inputValue); }}
          placeholder={tags.length === 0 ? placeholder : 'Add more...'}
        />
      </div>
      {hint && (
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: '6px' }}>{hint}</p>
      )}
    </div>
  );
}
