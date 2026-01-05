import debounce from 'lodash/debounce'
import { useEffect, useRef, useState } from 'react'

import { Loading } from '@/components/types'
import { DEBOUNCE_THRESHOLD, Z_INDEX_TOP } from '@/constants'
import { breakpoints } from '@/utils/media-query'

enum CrossIconPos {
  INSIDE = 'inside',
  TOP_RIGHT = 'top-right',
  RIGHT_TOP = 'right-top',
}

// padding: 16px + width: 24px => 40px
const iconPadding = 40

const CrossIconPosCss = (position: CrossIconPos) => {
  switch (position) {
    case CrossIconPos.TOP_RIGHT:
      return {
        top: `-${iconPadding}px`,
        right: '0px',
      }
    case CrossIconPos.RIGHT_TOP:
      return {
        top: '0px',
        right: `-${iconPadding}px`,
      }
    case CrossIconPos.INSIDE:
    default:
      return {
        top: '0px',
        right: '0px',
      }
  }
}

export const ImageModal = (props: {
  isOpen: boolean
  imgProps: React.ImgHTMLAttributes<HTMLImageElement>
  onImageModalClose: () => void
}) => {
  const { isOpen, imgProps, onImageModalClose } = props
  const imgRef = useRef<HTMLImageElement>(null)
  const [crossIconPos, setCrossIconPos] = useState(CrossIconPos.INSIDE)

  const checkFullScreenImageSize = () => {
    if (imgRef.current) {
      const img = imgRef.current
      const imgWidth = img.offsetWidth
      const imgHeight = img.offsetHeight
      const vw = window.innerWidth
      const vh = window.innerHeight

      if (imgWidth === vw) {
        if (vh - imgHeight < iconPadding * 2) {
          setCrossIconPos(CrossIconPos.INSIDE)
        } else {
          setCrossIconPos(CrossIconPos.TOP_RIGHT)
        }
      } else if (imgHeight === vh) {
        if (vw - imgWidth < iconPadding * 2) {
          setCrossIconPos(CrossIconPos.INSIDE)
        } else {
          setCrossIconPos(CrossIconPos.RIGHT_TOP)
        }
      } else {
        setCrossIconPos(CrossIconPos.INSIDE)
      }
    }
  }

  const handleWindowResize = debounce(() => {
    if (window.innerWidth <= breakpoints.desktop) {
      onImageModalClose?.()
    }
  }, DEBOUNCE_THRESHOLD)

  const handleESCPress = debounce((e) => {
    if (e.key === 'Escape') {
      onImageModalClose?.()
    }
  }, DEBOUNCE_THRESHOLD)

  useEffect(() => {
    window.addEventListener('keydown', handleESCPress)
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('keydown', handleESCPress)
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      checkFullScreenImageSize()
    }
  }, [isOpen])

  const closeBtn = (
    <button
      className="absolute flex h-6 w-6 cursor-pointer flex-col items-center justify-center border-none bg-transparent"
      style={{
        ...CrossIconPosCss(crossIconPos),
        filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.8))',
      }}
      onClick={onImageModalClose}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.77925 4.36516C5.38873 3.97463 4.75556 3.97463 4.36504 4.36516C3.97451 4.75568 3.97451 5.38885 4.36504 5.77937L10.5858 12.0001L4.36506 18.2208C3.97453 18.6114 3.97453 19.2445 4.36506 19.6351C4.75558 20.0256 5.38875 20.0256 5.77927 19.6351L12 13.4143L18.2207 19.6351C18.6112 20.0256 19.2444 20.0256 19.6349 19.6351C20.0255 19.2445 20.0255 18.6114 19.6349 18.2208L13.4142 12.0001L19.635 5.77937C20.0255 5.38885 20.0255 4.75568 19.635 4.36516C19.2444 3.97463 18.6113 3.97463 18.2207 4.36516L12 10.5859L5.77925 4.36516Z"
          fill="white"
        />
      </svg>
    </button>
  )

  return (
    isOpen && (
      <div
        className="fixed top-0 left-0 hidden h-screen w-screen items-center justify-center bg-black/50 lg:flex lg:flex-col"
        style={{ zIndex: Z_INDEX_TOP + 1 }}
        onClick={onImageModalClose}
      >
        <div className="relative">
          <img
            className="max-h-screen max-w-screen object-contain"
            ref={imgRef}
            loading={Loading.EAGER}
            {...imgProps}
          />
          {closeBtn}
        </div>
      </div>
    )
  )
}

export default ImageModal
