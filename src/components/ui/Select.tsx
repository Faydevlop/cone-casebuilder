import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, id, className = '', ...props }, ref) => {
    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={id} className="form-label">
            {label}
          </label>
        )}
        <select ref={ref} id={id} className="form-select" {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && !error && <span className="form-hint">{hint}</span>}
        {error && <span className="form-hint" style={{ color: 'var(--color-accent-red)' }}>{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
