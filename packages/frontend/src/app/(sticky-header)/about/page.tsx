import { Metadata } from 'next'
import Link from 'next/link'
import AuthorCard from '@/app/components/author-card'
import {
  API_URL,
  CREDIT_DONATE_URL,
  CONTRIBUTE_FORM,
  DEFAULT_AVATAR,
  DONATE_URL,
  EMAIL,
  GENERAL_DESCRIPTION,
  MAIN_SITE_URL,
  SUBSCRIBE_URL,
  SUBSCRIBE_TITLE,
  AuthorRole,
} from '@/app/constants'
import { sendGQLRequest } from '@/app/utils'
import './page.scss'

export const metadata: Metadata = {
  title: '關於少年報導者 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

export const revalidate = 86400

const authorGQL = `
query($where: AuthorWhereUniqueInput!) {
  author(where: $where) {
    avatar {
      resized {
        tiny
      }
    }
  }
}
`

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
    bio: '總監工作就是「總兼」，把大家的企畫統合，同時我也是一名記者。我和團隊努力把重要的新聞和事件，轉成豐富的報導，讓大家透過報導，更認識這個世界和自己。',
  },
  {
    slug: 'shaowen',
    name: '邱紹雯',
    role: AuthorRole.AUDITORS,
    roleName: '主編',
    avatar: '',
    bio: '主編就是協助稿件從企劃到編輯完成的主要橋樑。我也負責Podcast及教案規劃，用多元的呈現方式，把重要議題轉成孩子有興趣閱讀、老師家長容易教學應用的素材。',
  },
  {
    slug: 'wang-wei-han',
    name: '王崴漢',
    role: AuthorRole.AUDITORS,
    roleName: '記者',
    avatar: '',
    bio: '記者工作是在對的時機點，向社會拋出新的疑問，激發讀者對生命更深層，也更深刻的探索與思辨。期許自己能用文字及影像參與並記下具時代意義的重要現場。',
  },
  {
    slug: 'chen-li-ting',
    name: '陳麗婷',
    role: AuthorRole.AUDITORS,
    roleName: '記者',
    avatar: '',
    bio: '記者的工作是將每位人物的故事、事件歷程，透過每一次的訪問紀錄下來，並將重點寫成大家能夠讀懂的文章，讓讀者看到來自各領域的不同面貌，獲取更多的資訊。',
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
    slug: 'hychen',
    name: '黃禹禛',
    role: AuthorRole.DESIGNERS,
    roleName: '設計',
    avatar: '',
    bio: '在這裡，大家所看見的圖表、插畫、圖文故事，大大小小的視覺元素，都是由設計師或插畫家完成。希望透過圖像的力量，幫助讀者理解事件、開啟對世界的想像！',
  },
  {
    slug: 'jheng-han-wun',
    name: '鄭涵文',
    role: AuthorRole.DESIGNERS,
    roleName: '設計',
    avatar: '',
    bio: '在新聞的世界裡，「設計」這個角色就是要發力讓報導變得更好看、更好懂，所以我們把重要的故事情境化成畫作，把複雜的資料轉成圖表，努力吸引你們的眼球！',
  },
  {
    slug: 'yunruchen',
    name: '陳韻如',
    role: AuthorRole.EDITORS,
    roleName: '編輯',
    avatar: '',
    bio: '身為編輯，我是每篇報導的第一個讀者，要核對內容屬實無誤，也要給文章一個吸睛又能傳達重點的標題，同時我也要運用各種管道，讓更多讀者看見我們的文章，並且感同身受。',
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
    const res = await sendGQLRequest(API_URL, {
      query: authorGQL,
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
    <div id="us" className="us">
      <img src={'/assets/images/about_who_we_are.svg'} />
      <p>
        《少年報導者》是由非營利媒體《報導者》孕生出的「孩子」，我們對10～15歲的同學提供深度的新聞報導，每一篇文章都是記者獨立採訪、專家審核把關下完成。我們把每個兒童和少年當成獨立的大人，你們將是改變世界的起點。
      </p>
    </div>
  )

  const tellYou = (
    <div className="tell-you">
      <span className="title">在這裡，我們想告訴你們：</span>
      <div className="pics">
        {tellYouItems.map((item, index) => {
          return (
            <div key={`tell-you-${index}`} className="tell-you-item">
              <img src={item.image} />
              <p>{item.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )

  const news = (
    <div className="news">
      <span className="title">在這裡，你們可以這樣看新聞：</span>
      <div className="pics">
        <img src={'/assets/images/about_news_pic1.svg'} />
        <img src={'/assets/images/about_news_pic2.svg'} />
        <img src={'/assets/images/about_news_pic3.svg'} />
        <img src={'/assets/images/about_news_pic4.svg'} />
        <img src={'/assets/images/about_news_pic5.svg'} />
      </div>
    </div>
  )

  const subscribe = (
    <div className="subscribe">
      <div className="subscribe-desc">
        <div>
          <h3>{SUBSCRIBE_TITLE}</h3>
          <p>
            不要錯過和漏接《少年報導者》精彩的專題和報導，請訂閱我們，在新聞推出的第一時間就會收到通知！
          </p>
        </div>
        <Link className="btn-like" href={SUBSCRIBE_URL}>
          歡迎訂閱
        </Link>
      </div>
      <img src="/assets/images/about_CTA_subscribe.svg" />
    </div>
  )

  const contribute = (
    <div id="post" className="contribute">
      <h3>投稿給報導仔，成為小評論員</h3>
      <p>
        《少年報導者》是一個開放的公共平台，報導仔希望聽見大家的看法和心聲，歡迎10～15歲的同學投稿給報導仔，針對新聞時事、國家政策、校園生活，或是藝術文化、運動體育，都可以寫下你的觀點、評論，讓報導仔協助你成為我們的評論員。
      </p>
      <img className="road" src={'/assets/images/about_road.svg'} />
      <div className="desc">
        <span>
          投稿都會刊登嗎？
          <p>
            <br />
            •編輯群和專家會做討論
            <br />
            •如果刊登你會收到通知
            <br />
            •不合適刊登的文章不會另行通知
          </p>
        </span>
        <span>
          刊登有什麼獎勵？
          <p>
            <br />
            •你會收到微薄稿酬
            <br />
            •你會收到「少年報導者評論員」證書
          </p>
        </span>
      </div>
      <img
        className="certification"
        src={'/assets/images/about_certification_template.jpg'}
      />
      <p>少年報導者評論員證書範例</p>
      <div className="btn-like">
        <Link href={CONTRIBUTE_FORM}>我要投稿！</Link>
      </div>
    </div>
  )

  const mail = (
    <div id="mail" className="mail">
      <div className="mail-desc">
        <div>
          <h3>報導仔信箱，歡迎來信</h3>
          <p>
            如果想給我們的團隊一個鼓勵、一個建議，或提供採訪的線索，請寫信給報導仔，他會幫大家傳達。
          </p>
        </div>
        <span>
          聯絡信箱
          <br />
          <Link href={`mailto:${EMAIL}`}>{EMAIL}</Link>
        </span>
      </div>
      <img src="/assets/images/about_CTA_mail.svg" />
    </div>
  )

  const mainSite = (
    <div className="main-site">
      <img src={'/assets/images/about_go_to_main_site.png'} />
      <h3>大人通道，了解更多的《報導者》</h3>
      <p>
        如果您是家長、老師或是關注台灣媒體環境的大人們，我們邀請您進一步認識《報導者》。《報導者》以及《少年報導者》都是由非營利的報導者文化基金會支持，我們不靠商業廣告，是由讀者直接資助的獨立媒體，屢獲國內、外重要新聞獎項。我們致力開創媒體公共服務的精神，文章皆全文開放免費閱讀。
      </p>
      <p>
        無論針對大人及少年製作的報導，都仰賴大量專業人力製作，需要社會捐款贊助才能完成，希望您能成為製作好新聞的一股力量。報導者文化基金會遵從嚴謹的公益責信原則，每一筆捐款都公布在《報導者》官網，在報導者文化基金會董、監事監督下，依編務實務需求統籌分配於《報導者》及《少年報導者》，您的捐款收據不會註明使用在哪一個平台。
      </p>
      <div className="btns">
        <div className="btn-like">
          <Link href={MAIN_SITE_URL}>報導者官網</Link>
        </div>
        <div className="btn-like">
          <Link href={DONATE_URL}>贊助報導者</Link>
        </div>
        <div className="btn-like">
          <Link href={CREDIT_DONATE_URL}>了解捐款徵信</Link>
        </div>
      </div>
    </div>
  )

  return (
    <main>
      {us}
      {tellYou}
      {news}
      {subscribe}
      {contribute}
      {mail}
      <div id="team" className="team">
        <AuthorCard title="誰在為你服務" authors={teamMembers} />
      </div>
      <div id="consultants" className="consultants">
        <AuthorCard title="我們的顧問" authors={consultants} />
      </div>
      {mainSite}
    </main>
  )
}
