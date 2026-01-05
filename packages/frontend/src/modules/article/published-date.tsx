import { getFormattedDate } from '@/utils'

type DateProp = {
  date: string
}

export const PublishedDate = (props: DateProp) => {
  const date = props.date
  return (
    date && (
      <div className="post-date">刊出日期 {getFormattedDate(date) ?? ''}</div>
    )
  )
}

export default PublishedDate
