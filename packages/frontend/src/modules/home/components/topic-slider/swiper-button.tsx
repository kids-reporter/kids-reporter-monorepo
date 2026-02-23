import { cn } from '@kids-reporter/routing-ui'
import { useId } from 'react'

type SwiperButtonProps = {
  onClick: () => void
  variant: 'prev' | 'next'
  className?: string
}

function SwiperButton({ onClick, variant, className }: SwiperButtonProps) {
  const clipId = useId()
  return (
    <button
      type="button"
      className={cn(
        'cursor-pointer text-red-400 hover:text-red-500',
        className
      )}
      onClick={onClick}
    >
      {variant === 'prev' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
        >
          <g clipPath={`url(#${clipId})`}>
            <path
              d="M32 62C48.5685 62 62 48.5686 62 32C62 15.4315 48.5685 2.00001 32 2.00001C15.4315 2.00001 2 15.4315 2 32C2 48.5686 15.4315 62 32 62Z"
              fill="currentColor"
              stroke="white"
              strokeWidth="4"
              strokeMiterlimit="10"
            />
            <path
              d="M36 44L24.1052 32L36 20"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id={clipId}>
              <rect
                width="64"
                height="64"
                fill="white"
                transform="translate(64 64) rotate(180)"
              />
            </clipPath>
          </defs>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
        >
          <g clipPath={`url(#${clipId})`}>
            <path
              d="M32 62C48.5685 62 62 48.5686 62 32C62 15.4315 48.5685 2.00001 32 2.00001C15.4315 2.00001 2 15.4315 2 32C2 48.5686 15.4315 62 32 62Z"
              fill="currentColor"
              stroke="white"
              strokeWidth="4"
              strokeMiterlimit="10"
            />
            <path
              d="M28 44L39.8948 32L28 20"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id={clipId}>
              <rect
                width="64"
                height="64"
                fill="white"
                transform="translate(64 64) rotate(180)"
              />
            </clipPath>
          </defs>
        </svg>
      )}
    </button>
  )
}

export default SwiperButton
