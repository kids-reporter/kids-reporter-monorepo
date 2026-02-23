export { STATUS_CODES } from './status-codes'

import envVars from '@/environment-variables'
import { CategorySlug } from '@/types'

export const ACCESS_TOKEN_ENDPOINT = `${envVars.apiGatewayEndpoint}/auth/access-token`
export const REST_GQL_ENDPOINT = `${envVars.apiGatewayEndpoint}/api/rest`
export const INTERNAL_REST_GQL_ENDPOINT = `${envVars.internalApiGatewayEndpoint}/api/rest`
export const LOGOUT_ENDPOINT = '/api/logout'

export const KIDS_URL_ORIGIN = 'https://kids.twreporter.org'
export const SUBSCRIBE_URL = 'https://solink.soundon.fm/kidstwreporter'
export const CONTRIBUTE_FORM = 'https://forms.gle/7Yh4iPjfq92NDaSm9'
export const MAIN_SITE_URL = 'https://www.twreporter.org/'
export const DONATE_URL = 'https://support.twreporter.org/'
export const CREDIT_DONATE_URL = 'https://www.twreporter.org/a/credit-donate'
export const PRIVACY_POLICY = 'https://www.twreporter.org/a/privacy-policy'
export const EMAIL = 'kidsnews@twreporter.org'
export const NEWSLETTER_SUBSCRIPTION =
  'https://twreporter.us14.list-manage.com/subscribe?u=4da5a7d3b98dbc9fdad009e7e&id=2154ac40c3'
export const NEWSLETTER_PREVIEW =
  'https://us14.campaign-archive.com/?u=4da5a7d3b98dbc9fdad009e7e&id=83fc470a1b'

export const TOPIC_PAGE_ROUTE = '/topic/page'

export const BACK_TO_TOP_ELEMENT_ID = 'back-to-top'

export const OG_SUFFIX = '少年報導者 The Reporter for Kids'

export const GENERAL_DESCRIPTION =
  '《少年報導者》是由非營利媒體《報導者》針對兒少打造的深度新聞報導品牌，與兒童和少年一起理解世界，參與未來。'

export const SUBSCRIBE_TITLE = '訂閱《少年報導者》電子報'

export const Z_INDEX_TOP = 1000

export enum FontSizeLevel {
  NORMAL = 'normal',
  LARGE = 'large',
}

export enum Theme {
  YELLOW = 'yellow',
  BLUE = 'blue',
  RED = 'red',
}

export enum ThemeColor {
  YELLOW = '#f8c341',
  BLUE = '#27b3f5',
  RED = '#f76977',
}

export enum Color {
  DARK_GRAY = '#404040',
  LIGHT_GRAY = '#eaeaea',
  FONT_GRAY = '#808080',
  BORDER_GRAY = '#F8F8F8',
}

export const DEFAULT_THEME_COLOR = ThemeColor.YELLOW

export enum ContentType {
  ARTICLE = 'article',
  TOPIC = 'topic',
  AUTHOR = 'author',
  TAG = 'tag',
}

export enum AuthorRole {
  CONSULTANTS = '諮詢專家',
  COMIC_CONSULTANTS = '漫畫顧問',
  TEACH_DESIGN = '教學設計',
  DICTATION = '口述',
  AUTHORS = '作者',
  WRITERS = '文字',
  TRANSLATORS = '翻譯',
  PLANNERS = '企畫',
  INSTRUCTORS = '指導老師',
  PHOTOGRAPHERS = '攝影',
  LEAD_TEACHERS = '帶隊老師',
  PHOTO_INSTRUCTORS = '攝影指導',
  DESIGNERS = '設計',
  REVIEWERS = '核稿',
  AUDITORS = '審閱',
  EDITORS = '責任編輯',
  READERS = '讀報',
  DONATION_CONTACT = '捐書聯繫窗口',
  MARKETING = '行銷',
  LITTLE_HELPER = '小幫手',
}

export const AUTHOR_ROLES_IN_ORDER = [
  AuthorRole.CONSULTANTS,
  AuthorRole.COMIC_CONSULTANTS,
  AuthorRole.TEACH_DESIGN,
  AuthorRole.DICTATION,
  AuthorRole.AUTHORS,
  AuthorRole.WRITERS,
  AuthorRole.TRANSLATORS,
  AuthorRole.PLANNERS,
  AuthorRole.INSTRUCTORS,
  AuthorRole.PHOTOGRAPHERS,
  AuthorRole.LEAD_TEACHERS,
  AuthorRole.PHOTO_INSTRUCTORS,
  AuthorRole.DESIGNERS,
  AuthorRole.REVIEWERS,
  AuthorRole.AUDITORS,
  AuthorRole.EDITORS,
  AuthorRole.READERS,
  AuthorRole.DONATION_CONTACT,
  AuthorRole.MARKETING,
]

export const DEFAULT_AVATAR = '/assets/images/avatar_default.svg'

export const POST_PER_PAGE = 9

export const SEARCH_PLACEHOLDER = '搜尋更多新聞、議題'

export const ERROR_PAGE = '/error'

export const FALLBACK_IMG = '/assets/images/image_placeholder.png'

export const DEBOUNCE_THRESHOLD = 100

export const STICKY_HEADER_HEIGHT = 64

export const CATEGORY_IMAGES: Record<CategorySlug, string> = {
  news: '/assets/images/category_news.svg',
  storytelling: '/assets/images/category_storytelling.svg',
  campus: '/assets/images/category_campus.svg',
  classroom: '/assets/images/category_classroom.svg',
  'listening-news': '/assets/images/category_listening_news.svg',
}
