import { cn } from '@kids-reporter/routing-ui'

type IconButtonProps = {
  onClick: () => void
  ariaLabel: string
  className?: string
}

export function MinimizeButton({
  onClick,
  className,
  ariaLabel,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:text-neutral-800',
        className
      )}
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <rect
          x="7.82"
          y="25.25"
          width="16.36"
          height="3"
          rx="1.5"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}

export function MaximizeButton({
  onClick,
  className,
  ariaLabel,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:text-neutral-800',
        className
      )}
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <rect
          x="7.82"
          y="3.75"
          width="16.36"
          height="3"
          rx="1.5"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}

export function FullscreenButton({
  onClick,
  className,
  ariaLabel,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:text-neutral-800',
        className
      )}
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M5.33 12V7.33C5.33 6.23 6.23 5.33 7.33 5.33H12M20 5.33H24.67C25.77 5.33 26.67 6.23 26.67 7.33V12M26.67 20V24.67C26.67 25.77 25.77 26.67 24.67 26.67H20M12 26.67H7.33C6.23 26.67 5.33 25.77 5.33 24.67V20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export function FullscreenExitButton({
  onClick,
  className,
  ariaLabel,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:text-neutral-800',
        className
      )}
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M12 5.33V10C12 11.1 11.1 12 10 12H5.33M26.67 12H22C20.9 12 20 11.1 20 10V5.33M20 26.67V22C20 20.9 20.9 20 22 20H26.67M5.33 20H10C11.1 20 12 20.9 12 22V26.67"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export function CloseButton({
  onClick,
  className,
  ariaLabel,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:text-neutral-800',
        className
      )}
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M6.80748 6.80748C7.4909 6.12407 8.59894 6.12407 9.28236 6.80748L15.9999 13.525L22.7174 6.80748C23.4008 6.12407 24.5088 6.12407 25.1923 6.80748C25.8757 7.4909 25.8757 8.59894 25.1923 9.28236L18.4747 15.9999L25.1923 22.7174C25.8757 23.4008 25.8757 24.5088 25.1923 25.1923C24.5088 25.8757 23.4008 25.8757 22.7174 25.1923L15.9999 18.4747L9.28236 25.1923C8.59894 25.8757 7.4909 25.8757 6.80748 25.1923C6.12407 24.5088 6.12407 23.4008 6.80748 22.7174L13.525 15.9999L6.80748 9.28236C6.12407 8.59894 6.12407 7.4909 6.80748 6.80748Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}
