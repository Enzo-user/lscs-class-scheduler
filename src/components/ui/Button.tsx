import type { ComponentProps } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

/** Every native <button> prop, including `ref` (a plain prop in React 19). */
export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: Size
}

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap ' +
  'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark aria-disabled:hover:bg-brand',
  secondary: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-100',
  danger: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
}

// Minimum heights keep every button a comfortable touch target: 40px on
// phones, where the small size may shrink to 36px once a pointer is likely.
const SIZES: Record<Size, string> = {
  sm: 'min-h-10 px-3 text-sm sm:min-h-9',
  md: 'min-h-10 px-4 text-sm',
}

/** The one button style in the app; forwards every native <button> prop. */
export function Button({
  variant = 'secondary',
  size = 'md',
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...rest} />
  )
}
