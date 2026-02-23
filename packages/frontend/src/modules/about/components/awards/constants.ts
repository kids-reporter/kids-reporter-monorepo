/**
 * CMS-ready: replace AWARDS_BY_YEAR with props from page when CMS is wired.
 */

import { KIDS_URL_ORIGIN } from '@/constants'

export type WorkPart =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; href: string }

export type AwardCard = {
  id: string
  title: string
  workParts: WorkPart[]
  team: string
}

export type AwardsByYear = {
  year: string
  cards: AwardCard[]
}

export const AWARDS_BY_YEAR: AwardsByYear[] = [
  {
    year: '2025',
    cards: [
      {
        id: '2025-card1',
        title: '台北市立圖書館第88梯次「好書大家讀」優良少年兒童讀物入選',
        workParts: [
          { type: 'text', value: '出版品' },
          {
            type: 'link',
            value: '《我的14歲──不完美的青春冒險，成就獨一無二的小宇宙》',
            href: `${KIDS_URL_ORIGIN}/book/my-14-year-old-publish`,
          },
        ],
        team: '少年報導者團隊',
      },
    ],
  },
  {
    year: '2024',
    cards: [
      {
        id: '2024-card1',
        title: '第23屆卓越新聞獎【電視及網路（影音）類—短篇深度報導獎】',
        workParts: [
          { type: 'text', value: '紀錄片' },
          {
            type: 'link',
            value:
              '《人生的縫隙：台灣首位自力爭取就醫權的血癌男孩，迎來20歲的畢業考》',
            href: 'https://youtu.be/52n6SO6Cp4g?si=wOyw8EY9jCu2KL9r',
          },
        ],
        team: '林佑恩、鄭涵文、余志偉、楊惠君、吳嘉源',
      },
      {
        id: '2024-card2',
        title: '第38屆吳舜文新聞獎【影音類—深度報導獎】入圍',
        workParts: [
          { type: 'text', value: '紀錄片' },
          {
            type: 'link',
            value:
              '《人生的縫隙：台灣首位自力爭取就醫權的血癌男孩，迎來20歲的畢業考》',
            href: 'https://youtu.be/52n6SO6Cp4g?si=wOyw8EY9jCu2KL9r',
          },
        ],
        team: '林佑恩、鄭涵文、余志偉、楊惠君、吳嘉源',
      },
      {
        id: '2024-card3',
        title: '2023年度最佳少年兒童讀物獎【知識性讀物組】',
        workParts: [
          { type: 'text', value: '新聞雜誌書' },
          {
            type: 'link',
            value:
              '《戰爭與我們的距離：跟著《少年報導者》從一顆子彈、一隻病毒、一枚火箭、一張紙鈔、一場考試，揭開全球5種熱戰的新聞實境與影響》',
            href: `${KIDS_URL_ORIGIN}/topic/kids-magazine-1`,
          },
        ],
        team: '少年報導者團隊',
      },
      {
        id: '2024-card4',
        title: '2024年金鼎獎【兒童及少年圖書獎】入圍',
        workParts: [
          { type: 'text', value: '新聞雜誌書' },
          {
            type: 'link',
            value:
              '《戰爭與我們的距離：跟著《少年報導者》從一顆子彈、一隻病毒、一枚火箭、一張紙鈔、一場考試，揭開全球5種熱戰的新聞實境與影響》',
            href: `${KIDS_URL_ORIGIN}/topic/kids-magazine-1`,
          },
        ],
        team: '少年報導者團隊',
      },
      {
        id: '2024-card5',
        title: '2024年SND最佳新聞設計創意競賽【單一故事類—優勝】',
        workParts: [
          { type: 'text', value: '新聞社群互動' },
          {
            type: 'link',
            value: '《大約沒冬季》',
            href: 'https://www.instagram.com/p/CwRnQICSfD1/?img_index=1',
          },
        ],
        team: '王琳茱、黃禹禛、鄭涵文、汪彥成、張庭瑀',
      },
      {
        id: '2024-card6',
        title: '第50屆曾虛白先生新聞獎【媒體素養獎】入圍',
        workParts: [
          { type: 'text', value: '請問總統候選人Podcast （' },
          {
            type: 'link',
            value: '上集',
            href: `${KIDS_URL_ORIGIN}/article/podcast-presidential-election-kids-reporter-1`,
          },
          { type: 'text', value: '、' },
          {
            type: 'link',
            value: '下集',
            href: `${KIDS_URL_ORIGIN}/article/podcast-presidential-election-kids-reporter-2`,
          },
          { type: 'text', value: '）' },
        ],
        team: '楊惠君、邱紹雯、王崴漢、藍婉甄、陳韻如、陳思樺',
      },
    ],
  },
]
