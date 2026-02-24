export type Collaboration = {
  id: string
  title: string
  description: string
  image: string
}

export const COLLABORATIONS: Collaboration[] = [
  {
    id: 'campus_image_co_creation',
    title: '校園影像共創',
    description:
      '徵選學校影像共創計畫，結合新聞採訪與攝影教學，帶領學生關注並記錄在地文化與社會景象，實踐公共參與的媒體價值。',
    image: 'campus_image_co_creation.png',
  },
  {
    id: 'taiwan_reading_culture_foundation',
    title: '台灣閱讀文化基金會',
    description:
      '協辦「中小學線上數位閱讀專題探究競賽」，同步刊載學生優秀作品，並提供《少年報導者》特別獎，推動數位閱讀素養及媒體識讀。',
    image: 'taiwan_reading_culture_foundation.png',
  },
  {
    id: 'national_theater_concert_hall',
    title: '國家兩廳院',
    description:
      '合作「廳院好好玩」計畫，培訓藝文小記者走進四大藝術節，探索劇場與創作背後的故事與想像。',
    image: 'national_theater_concert_hall.png',
  },
  {
    id: 'ntu_d_school',
    title: '台大創新設計學院',
    description:
      '推出「大學好好玩」系列，拓展台大首創的大學探索學習與月經課內涵，串接高等教育與基礎教育的雙向對話，拓展創新教育的實踐與想像。',
    image: 'ntu_d_school.png',
  },
  {
    id: 'rare_disease_foundation',
    title: '罕見疾病基金會',
    description:
      '與罕病基金會合作舉辦小記者體驗營，讓孩子們透過採訪與交流，走進罕病同學的日常，搭起理解的橋梁，壯大非營利組織的社會力量。',
    image: 'rare_disease_foundation.png',
  },
  {
    id: 'factlink_digital_literacy_laboratory',
    title: 'FactLink數位素養實驗室',
    description:
      '與FactLink合作調查、剖析AI與資訊社會關鍵議題，推出「AI使用手冊」專欄，推廣全民數位識讀，強化未來公民資訊防衛力。',
    image: 'factlink_digital_literacy_laboratory.png',
  },
]
