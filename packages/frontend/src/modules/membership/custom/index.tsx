'use client'
import { HeaderMobileBackButtonHrefSetter } from '@kids-reporter/routing-ui'

import Checkbox from '@/components/checkbox'
import Divider from '@/components/divider'
import Switch from '@/components/switch'
import { BAODAOZAI_DEFAULT_ESSAY_QUESTION_COUNT } from '@/constants/baodaozai-question-count'

import MembershipSideMenu from '../components/side-menu'
import useOptimisticUpdateMemberReadingSettings from './hooks/use-optimistic-update-member-profile'

function Custom() {
  const {
    optimisticUpdateMemberReadingSettings,
    localShowBaodaozai,
    localEssayQuestionCount,
  } = useOptimisticUpdateMemberReadingSettings()

  return (
    <div className="mx-auto w-full bg-neutral-100 pt-6 pb-40 tablet:pt-8 desktop:px-12 desktop:pt-16 desktop:pb-50">
      <div className="mx-auto w-full max-w-300 tablet:grid tablet:grid-cols-12 tablet:gap-6 desktop:gap-8">
        <HeaderMobileBackButtonHrefSetter href="/member" />
        <div className="hidden tablet:col-span-2 tablet:block tablet:min-w-[150px]">
          <MembershipSideMenu />
        </div>
        <div className="flex flex-1 flex-col px-6 tablet:col-span-10 tablet:px-8 desktop:col-span-8 desktop:px-0">
          <h1 className="mb-6 prose-h4-small font-swei text-neutral-900 desktop:mb-8 desktop:prose-h4-large">
            閱讀設定
          </h1>
          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full items-center justify-between gap-6">
              <div className="flex flex-1 flex-col gap-1">
                <h2 className="prose-p1-bold font-swei text-neutral-900">
                  文章頁是否開啟報導仔
                </h2>
                <p className="prose-p1 text-neutral-700">
                  開啟後，部分文章頁會有報導仔陪伴你閱讀文章並可進行互動測驗！
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="prose-p2 text-neutral-700">開啟</span>
                <Switch
                  checked={localShowBaodaozai ?? false}
                  onChange={() =>
                    optimisticUpdateMemberReadingSettings({
                      showBaodaozai: !localShowBaodaozai,
                    })
                  }
                />
              </div>
            </div>

            <Divider />

            <div className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="prose-p1-bold font-swei text-neutral-900">
                  思辨題數量設定
                </h2>
                <p className="prose-p1 text-neutral-700">
                  互動測驗預設提供三題選擇題，系統會依你設定的思辨題數，自動添加思辨題數量。
                </p>
              </div>
              <div className="flex items-center gap-6 rounded-2xl bg-white px-6 py-5">
                <div className="flex items-center gap-6">
                  {[0, 1, 2, 3].map((count) => (
                    <Checkbox
                      key={count}
                      checked={
                        (localEssayQuestionCount ??
                          BAODAOZAI_DEFAULT_ESSAY_QUESTION_COUNT) === count
                      }
                      onChange={() =>
                        optimisticUpdateMemberReadingSettings({
                          essayQuestionCount: count,
                        })
                      }
                      label={`${count}題`}
                      value={count.toString()}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Custom
