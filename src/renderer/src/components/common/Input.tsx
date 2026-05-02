import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, fullWidth, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'input-full-width' : ''
    const errorClass = error ? 'input-error' : ''

    return (
      <div className={`input-wrapper ${widthClass} ${className}`}>
        {label && <label className="input-label">{label}</label>}
        <input ref={ref} className={`input-field ${errorClass}`} {...props} />
        {error && <span className="input-error-text">{error}</span>}
        {hint && !error && <span className="input-hint">{hint}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
