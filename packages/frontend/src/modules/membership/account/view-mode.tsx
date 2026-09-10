import Divider from '@/components/divider'
import { NO_DATA_TEXT } from '@/constants/input-field'

type ViewModeProps = {
  name: string
  nickname: string
  id: string
  contactEmail: string
  birthday: string
  location: string
  identity: string
  joinedDate: string
}

function ViewMode({
  name,
  nickname,
  id,
  contactEmail,
  birthday,
  location,
  identity,
  joinedDate,
}: ViewModeProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">全名</span>
            <span className="prose-p1 text-neutral-700">
              {name || NO_DATA_TEXT}
            </span>
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">暱稱</span>
            <span className="prose-p1 text-neutral-700">
              {nickname || NO_DATA_TEXT}
            </span>
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">
              少年報導者會員ID
            </span>
            <span className="prose-p1 text-neutral-700">
              {id || NO_DATA_TEXT}
            </span>
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">聯絡信箱</span>
            <span className="prose-p1 text-neutral-700">
              {contactEmail || NO_DATA_TEXT}
            </span>
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-1">
          <span className="prose-p1-bold text-neutral-900">生日</span>
          <span className="prose-p1 text-neutral-700">
            {birthday || NO_DATA_TEXT}
          </span>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-1">
          <span className="prose-p1-bold text-neutral-900">所在地</span>
          <span className="prose-p1 text-neutral-700">
            {location || NO_DATA_TEXT}
          </span>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-1">
          <span className="prose-p1-bold text-neutral-900">身份別</span>
          <span className="prose-p1 text-neutral-700">
            {identity || NO_DATA_TEXT}
          </span>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">加入日期</span>
            <span className="prose-p1 text-neutral-700">
              {joinedDate || NO_DATA_TEXT}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewMode
