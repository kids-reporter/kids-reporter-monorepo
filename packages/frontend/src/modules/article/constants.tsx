import { toast } from 'sonner'

import {
  FaceBookIcon,
  LineIcon,
  LinkIcon,
  ThreadsIcon,
} from '@/icons/miscellaneous'

export const TABLE_OF_CONTENT_ANCHOR_PREFIX = 'toc-anchor'
export const TABLE_OF_CONTENT_INDEX_PREFIX = 'toc-index'
export const TABLE_OF_CONTENT_BACK_TO_TOP_KEY = 'back-to-top'

export const SHARE_ICONS = [
  {
    icon: <FaceBookIcon />,
    label: 'Facebook',
    onClick: () => {
      const currentURL = window.location.href
      const location =
        'https://www.facebook.com/sharer/sharer.php?' +
        `u=${encodeURIComponent(currentURL)}`
      window.open(location, '_blank', 'noopener,noreferrer')
    },
  },
  {
    icon: <ThreadsIcon />,
    label: 'Threads',
    onClick: () => {
      const currentURL = window.location.href
      const location = `https://www.threads.net/intent/post?text=${encodeURIComponent(currentURL)}`
      window.open(location, '_blank', 'noopener,noreferrer')
    },
  },
  {
    icon: <LineIcon />,
    label: 'Line',
    onClick: () => {
      const currentURL = window.location.href
      const location = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
        currentURL
      )}`
      window.open(location, '_blank', 'noopener,noreferrer')
    },
  },
  {
    icon: <LinkIcon />,
    label: 'Link',
    onClick: () => {
      const currentURL = window.location.href
      navigator.clipboard
        .writeText(currentURL)
        .then(() => {
          toast.success('已複製文章網址')
        })
        .catch(() => {
          toast.error('複製文章網址失敗')
        })
    },
  },
]

export const ARTICLE_FONT_SIZE_CLASSNAMES = [
  '[&_h2]:prose-h2-small desktop:[&_h2]:prose-h2-large',
  '[&_h3]:prose-h3-small desktop:[&_h3]:prose-h3-large',
  '[&_h4]:prose-h4-small desktop:[&_h4]:prose-h4-large',
  '[&_h5]:prose-h5-small desktop:[&_h5]:prose-h5-large',
  '[&_h6]:prose-h6-small desktop:[&_h6]:prose-h6-large',
]

export const ARTICLE_FONT_SIZE_CLASSNAMES_LARGE = [
  '[&_h2]:text-[35px] desktop:[&_h2]:text-[50px]',
  '[&_h3]:text-[30px] desktop:[&_h3]:text-[40px]',
  '[&_h4]:text-[27.5px] desktop:[&_h4]:text-[35px]',
  '[&_h5]:text-[25px] desktop:[&_h5]:text-[27.5px]',
  '[&_h6]:text-[22.5px] desktop:[&_h6]:text-[22.5px]',
]
