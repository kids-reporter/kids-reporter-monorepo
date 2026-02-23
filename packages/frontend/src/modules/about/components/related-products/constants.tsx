export type Product = {
  id: string
  title: string
  description: string
  iconType: 'book' | 'podcast' | 'graduation_cap'
  illustration: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'publications',
    title: '出版品',
    description:
      '出版《戰爭與我們的距離》、《我的14歲》等讀物，透過實體出版深化閱讀素養。',
    iconType: 'book',
    illustration: 'publications.svg',
  },
  {
    id: 'podcast',
    title: 'Podcast',
    description:
      '製作「誰來讀新聞」Podcast節目，把世界上重要的事情「說」給大、小朋友聽。',
    iconType: 'podcast',
    illustration: 'podcast.svg',
  },
  {
    id: 'teaching_materials',
    title: '教案',
    description:
      '與專業教師團隊合作，為中小學課堂量身打造教學指南和示範簡報，將新聞議題融入課程。',
    iconType: 'graduation_cap',
    illustration: 'teaching_materials.svg',
  },
]
