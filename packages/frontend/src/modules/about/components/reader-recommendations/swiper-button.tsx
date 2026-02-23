import { cn } from '@kids-reporter/routing-ui'

type SwiperButtonProps = {
  onClick: () => void
  type: 'prev' | 'next'
  className?: string
}

function SwiperButton({ onClick, type, className }: SwiperButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'cursor-pointer text-red-400 hover:text-red-500',
        className
      )}
      type="button"
      aria-label={type === 'prev' ? 'Previous Button' : 'Next Button'}
    >
      {type === 'prev' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
        >
          <rect
            x="-1"
            y="1"
            width="42"
            height="42"
            rx="21"
            transform="matrix(-1 0 0 1 42 0)"
            fill="currentColor"
          />
          <rect
            x="-1"
            y="1"
            width="42"
            height="42"
            rx="21"
            transform="matrix(-1 0 0 1 42 0)"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M23.9609 30L16.0311 22L23.9609 14"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
        >
          <rect
            x="1"
            y="1"
            width="42"
            height="42"
            rx="21"
            fill="currentColor"
          />
          <rect
            x="1"
            y="1"
            width="42"
            height="42"
            rx="21"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M20.0391 30L27.9689 22L20.0391 14"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

export default SwiperButton
