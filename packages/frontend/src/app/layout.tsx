import '../globals.css'

import { Footer } from '@kids-reporter/routing-ui'
import { GoogleTagManager } from '@next/third-parties/google'
import { Noto_Sans_TC } from 'next/font/google'
import localFont from 'next/font/local'
import { headers } from 'next/headers'

import Providers from '@/components/providers'
import { Toaster } from '@/components/toaster'
import FeatureIntroDialog from '@/services/feature-intro/components/feature-info-dialog'
import { getServerTraceHeaders } from '@/utils/trace-context'

const GTM_ID = 'GTM-T37WZJ44'

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-tc',
})

const swei = localFont({
  src: '../assets/fonts/SweiMarkerSansCJKtc-Bold.woff2',
  variable: '--font-swei-marker',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const traceHeaders = getServerTraceHeaders(headers())
  return (
    <html className={`${notoSansTC.variable} ${swei.variable}`}>
      <GoogleTagManager gtmId={GTM_ID} />
      <body>
        <Providers traceHeaders={traceHeaders}>
          <FeatureIntroDialog />
          {children}
          <Footer />
          <Toaster />
        </Providers>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display: none; visibility: hidden;"></iframe>`,
          }}
        />
      </body>
    </html>
  )
}
