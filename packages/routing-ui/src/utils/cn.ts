import { ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge<'prose-typography'>({
  extend: {
    classGroups: {
      'prose-typography': [
        'prose-p1',
        'prose-p1-bold',
        'prose-p2',
        'prose-p2-bold',
        'prose-p3',
        'prose-p3-bold',
        'prose-p4',
        'prose-p4-bold',
        'prose-h1-large',
        'prose-h2-large',
        'prose-h3-large',
        'prose-h4-large',
        'prose-h5-large',
        'prose-h6-large',
        'prose-h1-small',
        'prose-h2-small',
        'prose-h3-small',
        'prose-h4-small',
        'prose-h5-small',
        'prose-h6-small',
      ],
    },
  },
})

/**
 * Combines clsx and tailwind-merge for optimal class merging.
 * @param inputs - Class names or conditional class values.
 * @returns A single string with merged class names.
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs))
}
