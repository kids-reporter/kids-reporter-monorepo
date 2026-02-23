import { MyReadingIconSmall, SettingsIconSmall } from '../icons'
import { MenuItem } from '../types'

export const SUBSCRIBE_URL =
  'https://twreporter.us14.list-manage.com/subscribe?u=4da5a7d3b98dbc9fdad009e7e&id=2154ac40c3'
export const DONATE_URL = 'https://support.twreporter.org/'
export const JOIN_US_URL = 'https://kids.twreporter.org/article/about-join-us'
export const PRIVACY_POLICY = 'https://www.twreporter.org/a/privacy-policy'
export const SEARCH_PLACEHOLDER = '搜尋更多新聞、議題'

export const MENU_ITEMS: MenuItem[] = [
  {
    label: '最新',
    href: '/all',
    subItems: [],
  },
  {
    label: '專題',
    href: '/topic/page',
    subItems: [],
  },
  {
    label: '新聞',
    href: '/category/news',
    subItems: [
      { label: '焦點新聞', href: '/category/news/times' },
      { label: '真的假的', href: '/category/news/knowledge' },
      { label: '人物故事', href: '/category/news/story' },
      { label: '文化報導', href: '/category/news/explore' },
      { label: '專欄', href: '/category/news/column' },
      { label: '英文新聞', href: '/categories/news/english-version' },
    ],
  },
  {
    label: '多媒體',
    href: '/category/storytelling',
    subItems: [
      { label: '圖解新聞', href: '/category/storytelling/times' },
      { label: '新聞遊戲', href: '/category/storytelling/news-game' },
      { label: '圖文故事', href: '/category/storytelling/graphic-story' },
    ],
  },
  {
    label: '校園',
    href: '/category/campus',
    subItems: [
      { label: '校園寶可夢', href: '/category/campus/campus-pokemon' },
      { label: '上課好好玩', href: '/category/campus/teaching' },
      { label: '小讀者連線', href: '/category/campus/joining' },
    ],
  },
  {
    label: 'Podcast',
    href: '/category/listening-news',
    subItems: [
      {
        label: '小記者，問什麼？',
        href: '/category/listening-news/kids-reporter-ask',
      },
      {
        label: '新聞讀報',
        href: '/category/listening-news/multilingual-listening-news',
      },
      {
        label: '新聞關鍵字',
        href: '/category/listening-news/listening-news-keywords',
      },
      {
        label: '文化關鍵字',
        href: '/category/listening-news/listening-news-culture-keywords',
      },
    ],
  },
  {
    label: '教案',
    href: '/category/classroom',
    subItems: [],
  },
]

export const MY_READING_URL = '/myreading'
export const READING_SETTINGS_URL = '/custom'

export const ADDITIONAL_MENU_ITEMS: MenuItem[] = [
  {
    label: '我的回答',
    href: MY_READING_URL,
    subItems: [],
    showIcon: true,
    icon: <MyReadingIconSmall />,
    hideInFooter: true,
  },
  {
    label: '閱讀設定',
    href: READING_SETTINGS_URL,
    subItems: [],
    showIcon: true,
    icon: <SettingsIconSmall />,
    hideInFooter: true,
  },
  {
    label: '小讀者觀點大集合',
    href: '/idea-hub',
    subItems: [],
    hideInFooter: true,
  },
  {
    label: '關於我們',
    href: '/about',
    subItems: [],
  },
  {
    label: '呼叫報導仔',
    href: '/about#call',
    subItems: [],
  },

  {
    label: '我要投稿',
    href: 'https://forms.gle/49AEG8kFj7QWjgij8',
    subItems: [],
    external: true,
  },
  {
    label: '加入小記者',
    href: 'https://forms.gle/eGq5jagNTwriwSCX6',
    subItems: [],
    external: true,
  },
  {
    label: '訂閱電子報',
    href: 'https://twreporter.us14.list-manage.com/subscribe?u=4da5a7d3b98dbc9fdad009e7e&id=2154ac40c3',
    subItems: [],
    external: true,
  },
  {
    label: '訂閱Podcast',
    href: 'https://solink.soundon.fm/kidstwreporter',
    subItems: [],
    external: true,
  },
  {
    label: '聯絡我們',
    href: '/about#contact',
    subItems: [],
  },
  {
    label: '前往《報導者》',
    href: 'https://www.twreporter.org/',
    subItems: [],
    external: true,
  },
]

export const SOCIAL_MEDIA_ITEMS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/twreporter/',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/twreporter/',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@TwreporterOrg',
  },
  {
    label: 'Threads',
    href: 'https://www.threads.com/@twreporter',
  },
  {
    label: 'Medium',
    href: 'https://medium.com/twreporter',
  },
  {
    label: 'RSS',
    href: 'https://kids-storage.twreporter.org/rss/rss.xml',
  },
]
