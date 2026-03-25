'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number | null
  onRate: (rating: number) => void
  showLabel?: boolean
}

export function StarRating({ rating, onRate, showLabel = true }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-2">
      {showLabel && <span className="text-[13px] text-muted-foreground">Rate effectiveness</span>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = rating !== null && starIndex <= rating
          return (
            <button
              key={starIndex}
              type="button"
              aria-label={`Rate effectiveness ${starIndex} out of 5`}
              onClick={() => onRate(starIndex)}
              className="flex items-center justify-center min-h-[36px] p-1 rounded transition-opacity hover:opacity-80"
            >
              <Star
                className="size-5"
                fill={isFilled ? '#FFB852' : 'none'}
                stroke={isFilled ? '#FFB852' : 'currentColor'}
                strokeWidth={1.5}
                style={{ color: isFilled ? '#FFB852' : undefined }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
