import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, id, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={id} className="form-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className="form-textarea"
          {...props}
        />
        {hint && !error && <span className="form-hint">{hint}</span>}
        {error && <span className="form-hint" style={{ color: 'var(--color-accent-red)' }}>{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
