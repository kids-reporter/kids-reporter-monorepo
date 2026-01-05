import Link from 'next/link'

type SubSubcategoryProp = {
  text: string
  link: string
}

export const SubSubcategory = (props: SubSubcategoryProp) => {
  return (
    props.text &&
    props.link && (
      <div className="post_primary_category">
        <Link className="rpjr-btn rpjr-btn-theme" href={props.link}>
          {props.text}
        </Link>
      </div>
    )
  )
}

export default SubSubcategory
