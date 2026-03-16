import { useEffect } from 'react'

function useBodyScrollLock({
  toLock,
  lockID = '',
}: {
  toLock: boolean
  lockID?: string
}) {
  useEffect(() => {
    const className = lockID ? `no-scroll--${lockID}` : `no-scroll`

    if (toLock) {
      document.body.classList.add(className)
      document.documentElement.classList.add(className)
    } else {
      document.body.classList.remove(className)
      document.documentElement.classList.remove(className)
    }

    return () => {
      document.body.classList.remove(className)
      document.documentElement.classList.remove(className)
    }
  }, [toLock, lockID])
}

export default useBodyScrollLock
