import { Header } from '@kids-reporter/routing-ui'
import Image from 'next/image'

import AuthHeaderLoggedInSetter from '@/components/auth-header-logged-in-setter'

function NotFound() {
  return (
    <main className="flex w-screen flex-col items-center">
      <Header />
      <AuthHeaderLoggedInSetter />

      <div className="flex min-h-[70vh] w-full max-w-[1200px] flex-col items-center justify-center px-6 pt-10 pb-16 tablet:px-8 desktop:px-10">
        <div className="flex flex-col items-center justify-center">
          <Image
            className="w-full max-w-72 tablet:max-w-md desktop:max-w-xl"
            src="/assets/images/404.png"
            alt="Not found"
            loading="lazy"
            width={572}
            height={572}
          />
          <div className="flex flex-col items-center justify-center gap-2.5">
            <h1 className="mt-6 text-center prose-h3-small text-neutral-900 md:prose-h3-large">
              很抱歉，找不到符合條件的頁面。
            </h1>
            <p className="text-center prose-p1 text-neutral-600">
              看起來在這個位置找不到東西。
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default NotFound
