export type Card = {
  id: string
  anchorId?: string
  title: string
  description: string
  buttonText: string
  actionType: 'dialog' | 'external' | 'mailto'
  actionValue: string
  icon: string
}

export const JOIN_US_CARDS: Card[] = [
  {
    id: 'call-baodaozai',
    anchorId: 'call',
    title: '呼叫報導仔',
    description:
      '2026年全新開發的閱讀探索新功能，有測驗、有互動、可留言，由小幫手「報導仔」協助下，閱讀文章效率加倍、趣味無限。',
    buttonText: '了解更多',
    actionType: 'dialog',
    actionValue: '',
    icon: '/assets/images/about/join-us/call_baodaozai.svg',
  },
  {
    id: 'newsletter',
    title: '訂閱《報導仔新聞聯絡簿》',
    description:
      '不要錯過和漏接《少年報導者》精彩的專題和報導，請訂閱我們，在新聞推出的第一時間就會收到通知！',
    buttonText: '訂閱電子報',
    actionType: 'external',
    actionValue:
      'https://twreporter.us14.list-manage.com/subscribe?u=4da5a7d3b98dbc9fdad009e7e&id=2154ac40c3',
    icon: '/assets/images/about/join-us/subscription.svg',
  },
  {
    id: 'join-us',
    title: '加入我們',
    description:
      '成為教案老師、小記者、小評論員，一起製作深度新聞報導等優質內容。',
    buttonText: '了解更多',
    actionType: 'external',
    actionValue: 'https://kids.twreporter.org/article/about-join-us',
    icon: '/assets/images/about/join-us/join_us.svg',
  },
  {
    id: 'contact',
    title: '報導仔信箱',
    description:
      '想給予鼓勵、建議？提供採訪線索？邀請講座？詢問授權？請寫信給報導仔，他會幫大家傳達。',
    buttonText: '聯絡我們',
    actionType: 'mailto',
    actionValue: 'kidsnews@twreporter.org',
    icon: '/assets/images/about/join-us/email.svg',
  },
]
