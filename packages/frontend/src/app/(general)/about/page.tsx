import type { GetAuthorAvatarQuery } from '__generated__/operations/content.generated'
import { Metadata } from 'next'
import Link from 'next/link'

import AuthorCard from '@/components/author-card'
import {
  AuthorRole,
  CONTRIBUTE_FORM,
  CREDIT_DONATE_URL,
  DEFAULT_AVATAR,
  DONATE_URL,
  EMAIL,
  GENERAL_DESCRIPTION,
  MAIN_SITE_URL,
  SUBSCRIBE_TITLE,
  SUBSCRIBE_URL,
} from '@/constants'
import envVars from '@/environment-variables'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const metadata: Metadata = {
  title: '關於少年報導者 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

export const revalidate = envVars.isProduction ? 86400 : 0 // 1 day

const tellYouItems = [
  { image: '/assets/images/about_tell_pic1.svg', desc: '重要的議題' },
  { image: '/assets/images/about_tell_pic2.svg', desc: '多元的社會' },
  { image: '/assets/images/about_tell_pic3.svg', desc: '國際的動態' },
  { image: '/assets/images/about_tell_pic4.svg', desc: '豐富的知識' },
  { image: '/assets/images/about_tell_pic5.svg', desc: '開放的思辨' },
]

const teamMembers = [
  {
    slug: 'jill718',
    name: '楊惠君',
    role: AuthorRole.REVIEWERS,
    roleName: '總監',
    avatar: '',
    bio: '總監工作就是「總兼」，把大家的企畫統合。我也是一名記者，和團隊努力把重要的新聞事件，轉成豐富的報導，讓大家更認識這個世界和自己。',
  },
  {
    slug: 'shaowen',
    name: '邱紹雯',
    role: AuthorRole.AUDITORS,
    roleName: '主編',
    avatar: '',
    bio: '主編是協助稿件從企劃到編輯完成的主要橋樑。我也負責Podcast及教案，以多元呈現方式，將議題轉成孩子有興趣閱讀、老師家長能應用的教材。',
  },
  {
    slug: 'sofia-wei',
    name: '韋麗文',
    role: AuthorRole.AUDITORS,
    roleName: '主編',
    avatar: '',
    bio: '主編，是從世界的紋理中發掘新聞議題，帶領團隊深入挖掘故事，讓報導既有深度，也有溫度。引領議題的開局，讓對話持續延展，正是新聞工作的魅力。',
  },
  {
    slug: 'wang-wei-han',
    name: '王崴漢',
    role: AuthorRole.AUDITORS,
    roleName: '記者',
    avatar: '',
    bio: '記者工作是在對的時機點，向社會拋出新的疑問，激發讀者對生命更深層、更深刻的思辨。期許自己能用文字及影像參與並記下具時代意義的重要現場。',
  },
  {
    slug: 'kl-wu',
    name: '吳冠伶',
    role: AuthorRole.EDITORS,
    roleName: '編輯',
    avatar: '',
    bio: '將內容編織成篇，在網頁上呈現，幫助讀者易消化、好吸收，就是我身為編輯的任務。我也仔細核對資訊是否正確，讓大家可以安心服用我們的文章。',
  },
  {
    slug: 'hychen',
    name: '黃禹禛',
    role: AuthorRole.DESIGNERS,
    roleName: '設計',
    avatar: '',
    bio: '在這裡所有圖表、插畫、圖文故事，大大小小的視覺元素，都是由設計師或插畫家完成。我希望透過圖像的力量，幫助讀者理解事件、開啟對世界的想像！',
  },
  {
    slug: 'chen-li-ting',
    name: '陳麗婷',
    role: AuthorRole.AUDITORS,
    roleName: '記者',
    avatar: '',
    bio: '記者的工作是將每位人物的故事、事件歷程，透過每次的訪問記錄下來，寫成大家能夠讀懂的文章，讓讀者看到來自各領域的不同面貌，獲取更多資訊。',
  },
  {
    slug: 'shakingwave',
    name: '余志偉',
    role: AuthorRole.PHOTOGRAPHERS,
    roleName: '攝影監製',
    avatar: '',
    bio: '我在左腦擅長理性邏輯的學習中，用圖像刺激右腦感性創意的思考，依報導內容開發出兼具資訊事實、引人入勝的圖像，讓報導有趣，豐富閱讀多重體驗。',
  },
  {
    slug: 'jheng-han-wun',
    name: '鄭涵文',
    role: AuthorRole.DESIGNERS,
    roleName: '設計',
    avatar: '',
    bio: '在新聞的世界裡，「設計」的角色就是要發力讓報導變得更好看、好懂，所以我們把重要的故事情境化成畫作，把複雜的資料轉成圖表，吸引你們的目光！',
  },
]

const consultants = [
  {
    slug: '',
    name: '陳明蕾',
    role: AuthorRole.CONSULTANTS,
    roleName: '閱讀素養專家',
    avatar: '/assets/images/consultant_陳明蕾.png',
    bio: '清華大學台灣語言研究與教學研究所副教授，同時亦主持清大柯華葳教授閱讀研究中心。',
  },
  {
    slug: '',
    name: '林玫伶',
    role: AuthorRole.CONSULTANTS,
    roleName: '教育專家',
    avatar: '/assets/images/consultant_林玫伶.png',
    bio: '曾任台北市大橋、明德、士東、國語實驗國小校長，現為清華大學竹師教育學院客座助理教授、台灣閱讀文化基金會數位閱讀推廣顧問。',
  },
  {
    slug: '',
    name: '黃惠鈴',
    role: AuthorRole.CONSULTANTS,
    roleName: '兒童文學家',
    avatar: '/assets/images/consultant_黃惠鈴.png',
    bio: '曾在媒體與出版工作，曾獲出版與文學獎，出過一些書與繪本，現勤於創作與企劃、諮商，在大學兼任繪本與兒童文學課程。',
  },
  {
    slug: '',
    name: '陳榮裕',
    role: AuthorRole.CONSULTANTS,
    roleName: '資深媒體人',
    avatar: '/assets/images/consultant_陳榮裕.png',
    bio: '曾任中學及大專教職，並為資深教育路線記者。現為紀錄片工作者，兼任佛光大學傳播學系助理教授。',
  },
]

export default async function About() {
  // Fetch memeber avatar
  for (const member of teamMembers) {
    const res = await sendRestGqlRequest<GetAuthorAvatarQuery>({
      operation: 'author-avatar',
      method: 'GET',
      variables: {
        where: {
          slug: member.slug,
        },
      },
    })
    const avatar = res?.data?.data?.author?.avatar?.resized?.tiny
    member.avatar = avatar ?? DEFAULT_AVATAR
  }

  const us = (
    <div
      id="us"
      style={{ width: '95vw', scrollMarginTop: '62px' }}
      className="flex max-w-2xl flex-col items-center justify-center gap-10"
    >
      <img src={'/assets/images/about_who_we_are.svg'} loading="lazy" />
      <p
        style={{ color: 'var(--paletteColor4)', letterSpacing: '0.9px' }}
        className="text-lg leading-9 font-normal"
      >
        《少年報導者》是由非營利媒體《報導者》孕生出的「孩子」，我們對10～15歲的同學提供深度的新聞報導，每一篇文章都是記者獨立採訪、專家審核把關下完成。我們把每個兒童和少年當成獨立的大人，你們將是改變世界的起點。
      </p>
    </div>
  )

  const tellYou = (
    <div
      style={{ width: '95vw' }}
      className="mb-10 flex max-w-4xl flex-col items-center justify-center"
    >
      <span
        style={{ letterSpacing: '1.08px' }}
        className="mt-10 mb-10 text-center text-xl font-bold md:text-2xl lg:text-3xl"
      >
        在這裡，我們想告訴你們：
      </span>
      <div className="flex max-w-2xl flex-row flex-wrap items-center justify-center gap-10">
        {tellYouItems.map((item, index) => {
          return (
            <div
              key={`tell-you-${index}`}
              className="flex flex-col items-center"
            >
              <img
                className="w-full max-w-36"
                src={item.image}
                loading="lazy"
              />
              <p
                style={{
                  color: 'var(--paletteColor4)',
                  letterSpacing: '1.08px',
                }}
                className="text-xl font-bold"
              >
                {item.desc}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )

  const news = (
    <div
      style={{ maxWidth: 'var(--normal-container-max-width)' }}
      className="mb-10 flex flex-col items-center justify-center"
    >
      <span
        style={{ letterSpacing: '1.08px' }}
        className="mt-10 mb-10 text-center text-xl font-bold md:text-2xl lg:text-3xl"
      >
        在這裡，你們可以這樣看新聞：
      </span>
      <div className="flex flex-row flex-wrap items-center justify-center gap-10">
        <img
          className="w-full max-w-80"
          src={'/assets/images/about_news_pic1.svg'}
          loading="lazy"
        />
        <img
          className="w-full max-w-80"
          src={'/assets/images/about_news_pic2.svg'}
          loading="lazy"
        />
        <img
          className="w-full max-w-80"
          src={'/assets/images/about_news_pic3.svg'}
          loading="lazy"
        />
        <img
          className="w-full max-w-80"
          src={'/assets/images/about_news_pic4.svg'}
          loading="lazy"
        />
        <img
          className="w-full max-w-80"
          src={'/assets/images/about_news_pic5.svg'}
          loading="lazy"
        />
      </div>
    </div>
  )

  const subscribe = (
    <div
      style={{
        width: '95vw',
        padding: '30px 50px 30px 50px',
        backgroundColor: 'var(--paletteColor6)',
      }}
      className="flex max-w-5xl flex-col items-center justify-between rounded-3xl md:flex-row md:justify-center"
    >
      <div className="flex flex-col items-center justify-between md:items-start">
        <div>
          <h3
            style={{
              fontFamily:
                'SweiMarkerSansCJKtc-Regular,noto sans tc, Sans-Serif, serif',
              lineHeight: '160%',
              letterSpacing: '.08em',
              marginBottom:
                'calc(var(--has-content-spacing, 1)*(0.3em + 10px))',
            }}
            className="text-center text-xl font-bold text-white md:text-left md:text-3xl"
          >
            {SUBSCRIBE_TITLE}
          </h3>
          <p
            style={{ letterSpacing: '.08em', lineHeight: '160%' }}
            className="pb-10 text-sm md:text-lg"
          >
            不要錯過和漏接《少年報導者》精彩的專題和報導，請訂閱我們，在新聞推出的第一時間就會收到通知！
          </p>
        </div>
        <Link
          style={{ width: 'fit-content' }}
          className="rounded-full bg-white p-4 text-sm md:text-lg"
          href={SUBSCRIBE_URL}
        >
          歡迎訂閱
        </Link>
      </div>
      <img
        className="w-full max-w-44 md:max-w-72 lg:max-w-80"
        src="/assets/images/about_CTA_subscribe.svg"
        loading="lazy"
      />
    </div>
  )

  const contribute = (
    <div
      id="post"
      style={{
        width: '95vw',
        padding: '40px 30px 38px 40px',
        backgroundColor: 'var(--paletteColor1)',
        scrollMarginTop: '62px',
      }}
      className="flex max-w-5xl flex-col items-center justify-between rounded-3xl"
    >
      <h3
        style={{
          fontFamily:
            'SweiMarkerSansCJKtc-Regular,noto sans tc, Sans-Serif, serif',
          lineHeight: '160%',
          letterSpacing: '.08em',
          marginBottom: 'calc(var(--has-content-spacing, 1)*(0.3em + 10px))',
        }}
        className="text-xl font-bold text-white md:text-3xl"
      >
        投稿給報導仔，成為小評論員
      </h3>
      <p
        style={{ letterSpacing: '.08em', color: 'var(--paletteColor4)' }}
        className="mr-auto ml-auto max-w-xl pb-10 text-sm leading-9 md:text-lg"
      >
        《少年報導者》是一個開放的公共平台，報導仔希望聽見大家的看法和心聲，歡迎10～15歲的同學投稿給報導仔，針對新聞時事、國家政策、校園生活，或是藝術文化、運動體育，都可以寫下你的觀點、評論，讓報導仔協助你成為我們的評論員。
      </p>
      <img
        className="w-full max-w-2xl"
        src={'/assets/images/about_road.svg'}
        loading="lazy"
      />
      <div className="mt-10 mb-10 flex flex-row flex-wrap items-start justify-around gap-10">
        <span
          style={{ color: 'var(--paletteColor8)', letterSpacing: '1.08px' }}
          className="max-w-80 text-lg font-normal md:text-xl"
        >
          投稿都會刊登嗎？
          <p
            style={{ letterSpacing: '.08em', lineHeight: '160%' }}
            className="pb-10 text-sm text-black md:text-lg"
          >
            <br />
            •編輯群和專家會做討論
            <br />
            •如果刊登你會收到通知
            <br />
            •不合適刊登的文章不會另行通知
          </p>
        </span>
        <span
          style={{ color: 'var(--paletteColor8)', letterSpacing: '1.08px' }}
          className="max-w-80 text-lg font-normal md:text-xl"
        >
          刊登有什麼獎勵？
          <p
            style={{ letterSpacing: '.08em', lineHeight: '160%' }}
            className="pb-10 text-sm text-black md:text-lg"
          >
            <br />
            •你會收到微薄稿酬
            <br />
            •你會收到「少年報導者評論員」證書
          </p>
        </span>
      </div>
      <img
        className="w-full max-w-4xl"
        src={'/assets/images/about_certification_template.png'}
        loading="lazy"
      />
      <p
        style={{ letterSpacing: '.08em', lineHeight: '160%' }}
        className="pb-10 text-sm text-black md:text-lg"
      >
        少年報導者評論員證書範例
      </p>
      <div className="rounded-full bg-white p-4 text-sm md:text-lg">
        <Link href={CONTRIBUTE_FORM}>我要投稿！</Link>
      </div>
    </div>
  )

  const mail = (
    <div
      id="mail"
      style={{
        width: '95vw',
        scrollMarginTop: '62px',
        padding: '40px 30px 38px 40px',
        backgroundColor: 'var(--paletteColor5)',
      }}
      className="flex max-w-5xl flex-col items-center justify-center rounded-3xl md:flex-row md:justify-between"
    >
      <div className="flex flex-col items-center justify-between md:items-start">
        <div>
          <h3
            style={{
              fontFamily:
                'SweiMarkerSansCJKtc-Regular,noto sans tc, Sans-Serif, serif',
              lineHeight: '160%',
              letterSpacing: '.08em',
              marginBottom:
                'calc(var(--has-content-spacing, 1)*(0.3em + 10px))',
            }}
            className="text-center text-xl font-bold text-white md:text-left md:text-3xl"
          >
            報導仔信箱，歡迎來信
          </h3>
          <p
            style={{ letterSpacing: '.08em', lineHeight: '160%' }}
            className="pb-10 text-sm md:text-lg"
          >
            如果想給我們的團隊一個鼓勵、一個建議，或提供採訪的線索，請寫信給報導仔，他會幫大家傳達。
          </p>
        </div>
        <span
          style={{ letterSpacing: '.08em', lineHeight: '160%' }}
          className="text-sm text-white md:text-lg"
        >
          聯絡信箱
          <br />
          <Link href={`mailto:${EMAIL}`}>{EMAIL}</Link>
        </span>
      </div>
      <img
        className="w-full max-w-44 md:max-w-72 lg:max-w-80"
        src="/assets/images/about_CTA_mail.svg"
        loading="lazy"
      />
    </div>
  )

  const mainSite = (
    <div
      style={{
        width: '95vw',
        padding: '40px 30px 38px 40px',
        backgroundColor: 'var(--paletteColor6)',
      }}
      className="flex max-w-5xl flex-col items-center justify-between rounded-3xl"
    >
      <img
        className="mb-10 w-full max-w-80"
        src={'/assets/images/about_go_to_main_site.png'}
        loading="lazy"
      />
      <h3
        style={{
          fontFamily:
            'SweiMarkerSansCJKtc-Regular,noto sans tc, Sans-Serif, serif',
          lineHeight: '160%',
          letterSpacing: '.08em',
          marginBottom: 'calc(var(--has-content-spacing, 1)*(0.3em + 10px))',
        }}
        className="text-xl font-bold text-white md:text-3xl"
      >
        大人通道，了解更多的《報導者》
      </h3>
      <p
        style={{ letterSpacing: '.08em', lineHeight: '160%' }}
        className="max-w-xl pb-10 text-lg"
      >
        如果您是家長、老師或是關注台灣媒體環境的大人們，我們邀請您進一步認識《報導者》。《報導者》以及《少年報導者》都是由非營利的報導者文化基金會支持，我們不靠商業廣告，是由讀者直接資助的獨立媒體，屢獲國內、外重要新聞獎項。我們致力開創媒體公共服務的精神，文章皆全文開放免費閱讀。
      </p>
      <p
        style={{ letterSpacing: '.08em', lineHeight: '160%' }}
        className="max-w-xl pb-10 text-lg"
      >
        無論針對大人及少年製作的報導，都仰賴大量專業人力製作，需要社會捐款贊助才能完成，希望您能成為製作好新聞的一股力量。報導者文化基金會遵從嚴謹的公益責信原則，每一筆捐款都公布在《報導者》官網，在報導者文化基金會董、監事監督下，依編務實務需求統籌分配於《報導者》及《少年報導者》，您的捐款收據不會註明使用在哪一個平台。
      </p>
      <div className="flex w-full max-w-xl flex-row flex-wrap items-center justify-around">
        <div
          style={{ width: 'fit-content' }}
          className="mb-2 rounded-full bg-white p-4"
        >
          <Link href={MAIN_SITE_URL}>報導者官網</Link>
        </div>
        <div
          style={{ width: 'fit-content' }}
          className="mb-2 rounded-full bg-white p-4"
        >
          <Link href={DONATE_URL}>贊助報導者</Link>
        </div>
        <div
          style={{ width: 'fit-content' }}
          className="mb-2 rounded-full bg-white p-4"
        >
          <Link href={CREDIT_DONATE_URL}>了解捐款徵信</Link>
        </div>
      </div>
    </div>
  )

  return (
    <main className="flex flex-col items-center justify-center gap-10">
      {us}
      {tellYou}
      {news}
      {subscribe}
      {contribute}
      {mail}
      <div id="team" style={{ width: '95vw', scrollMarginTop: '62px' }}>
        <AuthorCard title="誰在為你服務" authors={teamMembers} />
      </div>
      <div id="consultants" style={{ width: '95vw', scrollMarginTop: '62px' }}>
        <AuthorCard title="我們的顧問" authors={consultants} />
      </div>
      {mainSite}
    </main>
  )
}
