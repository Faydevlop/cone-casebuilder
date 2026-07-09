interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function ToggleSwitch({ id: _id, checked, onChange, label, disabled = false }: ToggleSwitchProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      cursor: disabled ? 'not-allowed' : 'pointer',
      userSelect: 'none',
    }} onClick={() => !disabled && onChange(!checked)}>
      
      {/* Switch Outer track */}
      <div style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: checked ? 'var(--color-primary)' : 'var(--color-border)',
        position: 'relative',
        transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
      }}>
        {/* Switch Knob */}
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#ffffff',
          position: 'absolute',
          top: '3px',
          left: checked ? '23px' : '3px',
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }} />
      </div>

      {label && (
        <span style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 600,
          color: 'var(--color-primary)',
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
