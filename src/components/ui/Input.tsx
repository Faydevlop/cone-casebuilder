import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  suffix?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, suffix, error, id, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={id} className="form-label">
            {label}
          </label>
        )}
        {suffix ? (
          <div className="input-with-suffix">
            <input
              ref={ref}
              id={id}
              className="form-input"
              {...props}
            />
            <span className="input-suffix">{suffix}</span>
          </div>
        ) : (
          <input
            ref={ref}
            id={id}
            className="form-input"
            {...props}
          />
        )}
        {hint && !error && <span className="form-hint">{hint}</span>}
        {error && <span className="form-hint" style={{ color: 'var(--color-accent-red)' }}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
