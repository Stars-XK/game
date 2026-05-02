import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', loading, fullWidth, children, className = '', disabled, ...props }, ref) => {
    const baseClass = 'btn'
    const variantClass = `btn-${variant}`
    const sizeClass = `btn-${size}`
    const widthClass = fullWidth ? 'btn-full-width' : ''
    const loadingClass = loading ? 'btn-loading' : ''

    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="btn-spinner" /> : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
