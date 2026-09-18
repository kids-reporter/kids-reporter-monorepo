import { graphql } from '@keystone-6/core'
import { emitStructured } from '@kids-reporter/logger'
// @ts-ignore `@twreporter/errors` does not have typescript definition file yet
import _errors from '@twreporter/errors'
import axios, { AxiosError } from 'axios'
import { convertFromRaw } from 'draft-js'
import { GraphQLError } from 'graphql'

import { RoleEnum } from '../constants/role-enum'
import envVar from '../environment-variables'
import type { Context } from '../types/index'

const systemPrompt = `你是一位具有幽默感的閱讀陪伴精靈和出題助理，請回傳 JSON，格式固定如下：
{
  "opening": string,
  "choices": [
    { "title": string, "options": [string, string, string], "answerIndex": 0|1|2, "reason": string }
  ],
  "essays": [
    { "title": string, "hint": string }
  ]
}

不要輸出任何解說或前後綴文字，只能輸出 JSON。`

function generateUserPrompt(content: string) {
  return `
你是一個活潑可愛的閱讀陪伴精靈。請閱讀以下文章內容，並產出三部分內容：
1. opening: 一段約 60 字的童趣引言文案，目標是吸引約 10 歲孩子的好奇心。語氣活潑可愛，內容自然融入文章核心訊息，避免使用「報導仔」、「小朋友」、「閱讀精靈」、「嗨嗨～」，可加入問句或驚嘆句。
2. choices: 三題選擇題，幫助孩子理解文章的觀點與關鍵資訊。題目設計如下：
  - 第一題：與上述文案主題呼應，呈現一個在真實情境中可能出現的知識應用問題，鼓勵孩子將文章的關鍵概念延伸思考，避免僅為句子比對型題目（例如「下列哪一句」）。
  - 第二題：聚焦文章背景或原因理解，測試孩子對文章中重要背景資訊的掌握。
  - 第三題：聚焦文章後續意義、影響或結果的邏輯推論，使孩子從文章中提煉出「所以會…」或「因此可能…」的關鍵。
  每題附三個選項（A、B、C）與標明正確答案及詳解，正確答案需隨機出現選項中，不要三題都是一樣的選項。難度適合10歲孩子，並且題目要凸顯文章的核心觀點或媒體報導的獨特資訊。正確答案及詳解字數須控制於30字以內。
3. essays: 三題思辨題，為開放式提問，目的在於：
  - 引導孩子從文章不同段落或知識點中整合思考；
  - 探討文章中可能存在的觀點差異、價值衝突、或延伸應用；
  - 鼓勵孩子提出自己的意見或觀察，而不是尋找單一正確答案。
  語氣同樣活潑可愛、鼓勵表達，主題需貼合文章內容。

內文：
${content}
`
}

export const extendGraphqlSchema = graphql.extend(() => {
  return {
    mutation: {
      generatePostQuestions: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        args: {
          postId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        },
        async resolve(root, args, ctx: Context) {
          const { postId } = args as { postId: string }
          const traceLogFields = ctx.res?.locals?.traceLogFields || {}
          try {
            const post = await ctx.query.Post.findOne({
              where: { id: postId },
              query: 'content opening',
            })

            const plainContent = convertFromRaw(post.content).getPlainText(',')

            const client = axios.create({
              baseURL: 'https://api.openai.com/v1/chat',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${envVar.openAI.key}`,
                'OpenAI-Organization': envVar.openAI.organization,
                'OpenAI-Project': envVar.openAI.project,
              },
            })

            const body = {
              model: 'gpt-5.1',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: generateUserPrompt(plainContent) },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.7,
            }

            const res = await client.post('/completions', body)

            // GCP structured logging
            emitStructured({
              severity: 'INFO',
              message: 'generatePostQuestions response',
              context: {
                function: 'generatePostQuestions',
                postId,
                data: res.data,
              },
              ...traceLogFields,
            })

            const content: string | undefined =
              res?.data?.choices?.[0]?.message?.content
            const parsed: {
              opening?: string
              choices?: [
                {
                  title?: string
                  options?: string[]
                  answerIndex?: number
                  reason?: string
                },
              ]
              essays?: [{ title?: string; hint?: string }]
            } = (() => {
              try {
                return JSON.parse(content || '{}')
              } catch {
                return {}
              }
            })()

            const choices = Array.isArray(parsed?.choices) ? parsed.choices : []
            const essays = Array.isArray(parsed?.essays) ? parsed.essays : []

            if (parsed.opening) {
              const newOpening = post.opening
                ? `${post.opening}
新版內容：${parsed.opening}`
                : parsed.opening

              await ctx.query.Post.updateOne({
                data: { opening: newOpening },
                where: { id: postId },
              })
            }

            for (let i = 0; i < choices.length; i++) {
              const q = choices[i]
              if (!q || typeof q.title !== 'string') {
                continue
              }
              const answerIndex =
                typeof q.answerIndex === 'number' ? q.answerIndex : 0
              const options = (Array.isArray(q.options) ? q.options : []).map(
                (content, idx) => ({
                  content: typeof content === 'string' ? content : '',
                  isCorrectAnswer: answerIndex === idx,
                })
              )
              const reason = typeof q.reason === 'string' ? q.reason : ''
              await ctx.query.PostChoiceQuestion.createOne({
                data: {
                  post: { connect: { id: postId } },
                  title: q.title,
                  options,
                  reason,
                },
                query: 'id',
              })
            }

            for (let i = 0; i < essays.length; i++) {
              const q = essays[i]
              if (!q || typeof q.title !== 'string') {
                continue
              }
              const hint = typeof q.hint === 'string' ? q.hint : ''
              await ctx.query.PostEssayQuestion.createOne({
                data: {
                  post: { connect: { id: postId } },
                  title: q.title,
                  hint,
                },
                query: 'id',
              })
            }

            return true
          } catch (_err) {
            const err = _err instanceof Error ? _err : new Error(String(_err))
            let errorMessage =
              err.stack || err.message || 'generatePostQuestions failed'

            if (_err instanceof AxiosError) {
              const annotatedErr = _errors.helpers.annotateAxiosError(_err)
              errorMessage = _errors.helpers.printAll(annotatedErr, {
                withStack: true,
                withPayload: true,
              })
            }

            // GCP structured logging
            emitStructured({
              severity: 'ERROR',
              message: errorMessage,
              context: {
                function: 'generatePostQuestions',
                postId,
              },
              ...traceLogFields,
            })

            throw new GraphQLError(
              'Internal server error while generating post questions',
              {
                extensions: {
                  code: 'INTERNAL_SERVER_ERROR',
                  http: {
                    status: 500,
                  },
                },
              }
            )
          }
        },
      }),
    },
    query: {
      searchTWReporterPosts: graphql.field({
        type: graphql.list(
          graphql.object<{
            src: string
            ogImgSrc: string | null
            ogTitle: string | null
            ogDescription: string | null
            publishedDate: string | null
            subcategory: string | null
            category: string | null
          }>()({
            name: 'searchTWReporterPostsResult',
            fields: {
              src: graphql.field({ type: graphql.String }),
              ogImgSrc: graphql.field({ type: graphql.String }),
              ogTitle: graphql.field({ type: graphql.String }),
              ogDescription: graphql.field({ type: graphql.String }),
              publishedDate: graphql.field({ type: graphql.String }),
              subcategory: graphql.field({ type: graphql.String }),
              category: graphql.field({ type: graphql.String }),
            },
          })
        ),
        args: {
          keywords: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve(root, args, ctx: Context) {
          const { keywords } = args
          const traceLogFields = ctx.res?.locals?.traceLogFields || {}

          const session = ctx.session
          const isUnauthorized = !session
          const isForbidden = ![
            RoleEnum.Admin,
            RoleEnum.Contributor,
            RoleEnum.Editor,
            RoleEnum.Developer,
            RoleEnum.Owner,
          ].includes(session?.data?.role ?? '')

          if (isUnauthorized || isForbidden) {
            const errorMessage = isUnauthorized
              ? 'Unauthorized to search TW Reporter posts'
              : 'Forbidden to search TW Reporter posts'

            const errorCode = isUnauthorized ? 'UNAUTHENTICATED' : 'FORBIDDEN'

            emitStructured({
              severity: 'WARNING',
              message: errorMessage,
              context: {
                function: 'searchTWReporterPosts',
                keywords,
                errorCode,
              },
              ...traceLogFields,
            })

            throw new GraphQLError(errorMessage, {
              extensions: {
                code: errorCode,
                http: {
                  status: isUnauthorized ? 401 : 403,
                },
              },
            })
          }

          if (!keywords || !envVar.searchAPIKey || !envVar.twreporterID) {
            return []
          }

          const customSearchURL = `https://www.googleapis.com/customsearch/v1?key=${envVar.searchAPIKey}&cx=${envVar.twreporterID}`

          try {
            const response = await axios.get(`${customSearchURL}&q=${keywords}`)
            const posts = response?.data?.items
              ?.filter(
                (item: any) =>
                  item?.link?.match('^https://www.twreporter.org/') &&
                  (item?.pagemap?.metatags?.[0]['og:type'] === 'article' ||
                    item?.link?.includes('/topics/'))
              )
              ?.map((item: any) => {
                const metaTag = item?.pagemap?.metatags?.[0] ?? {}
                const toNonEmptyStringOrNull = (
                  value: unknown
                ): string | null => {
                  if (typeof value !== 'string') return null
                  const trimmed = value.trim()
                  return trimmed.length > 0 ? trimmed : null
                }
                const publishedDateObj = new Date(
                  item?.snippet
                    ?.split('...')?.[0]
                    .trim()
                    .replace('年', '-')
                    .replace('月', '-')
                    .replace('日', '')
                )
                const publishedDate = isNaN(publishedDateObj.getTime())
                  ? null
                  : publishedDateObj.toISOString()

                const articlePublishedTimeRaw = toNonEmptyStringOrNull(
                  metaTag['article:published_time']
                )
                const articlePublishedTimeObj = articlePublishedTimeRaw
                  ? new Date(articlePublishedTimeRaw)
                  : null
                const articlePublishedTimeIso =
                  articlePublishedTimeObj &&
                  !isNaN(articlePublishedTimeObj.getTime())
                    ? articlePublishedTimeObj.toISOString()
                    : null
                return {
                  src: item.link,
                  ogImgSrc: toNonEmptyStringOrNull(metaTag['og:image']),
                  ogTitle: toNonEmptyStringOrNull(metaTag['og:title']),
                  ogDescription: toNonEmptyStringOrNull(
                    metaTag['og:description']
                  ),
                  publishedDate: articlePublishedTimeIso ?? publishedDate,
                  subcategory: toNonEmptyStringOrNull(
                    metaTag['twreporter:subcategory']
                  ),
                  category: toNonEmptyStringOrNull(
                    metaTag['twreporter:category']
                  ),
                }
              })

            emitStructured({
              severity: 'INFO',
              message: 'searchTWReporterPosts response',
              context: {
                function: 'searchTWReporterPosts',
                keywords,
                data: response.data,
              },
              ...traceLogFields,
            })

            return posts || []
          } catch (_err) {
            const err = _err instanceof Error ? _err : new Error(String(_err))
            let errorMessage =
              err.stack || err.message || 'searchTWReporterPosts failed'

            if (_err instanceof AxiosError) {
              const annotatedErr = _errors.helpers.annotateAxiosError(_err)
              errorMessage = _errors.helpers.printAll(annotatedErr, {
                withStack: true,
                withPayload: true,
              })
            }

            // GCP structured logging
            emitStructured({
              severity: 'ERROR',
              message: errorMessage,
              context: {
                function: 'searchTWReporterPosts',
                keywords,
              },
              ...traceLogFields,
            })

            throw new GraphQLError(
              'Internal server error while searching TW Reporter posts',
              {
                extensions: {
                  code: 'INTERNAL_SERVER_ERROR',
                  http: {
                    status: 500,
                  },
                },
              }
            )
          }
        },
      }),
    },
    type: {},
  }
})
