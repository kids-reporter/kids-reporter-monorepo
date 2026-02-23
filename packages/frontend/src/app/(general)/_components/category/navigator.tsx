import Link from 'next/link'

type NavigatorProp = {
  name: string
  path: string
  active?: boolean
}

export const Navigator = (props: NavigatorProp) => {
  const name = props.name
  const path = props.path

  return (
    <Link
      className={`rpjr-btn-ghost rpjr-btn ${
        props.active ? 'rpjr-btn__current' : ''
      }`}
      href={path}
    >
      &nbsp;{name}
    </Link>
  )
}

export default Navigator
