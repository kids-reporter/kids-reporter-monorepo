import axios from 'axios'

import { config } from './configs.js'
import {
  errorHandling,
  errors,
  formatAxiosError,
  TokenManager,
} from './utils.js'

// fetch keystone session cookie token
const tokenManager = new TokenManager(
  config.cronjobAccount.email,
  config.cronjobAccount.password,
  config.apiUrl
)

const getScheduledPosts = async () => {
  // fetch qualified scheduled posts
  const getPayload = {
    query: `
      query Posts($where: PostWhereInput!) {
        posts(where: $where) {
          id
        }
      }
    `,
    variables: {
      where: {
        status: {
          equals: 'scheduled',
        },
        publishedDate: {
          lte: new Date().toISOString(),
        },
      },
    },
  }
  try {
    const token = await tokenManager.getToken()
    const dataRes = await axios.post(config.apiUrl, getPayload, {
      withCredentials: true,
      headers: {
        Cookie: `keystonejs-session=${token}`,
      },
    })
    const data = dataRes?.data?.data?.posts
    const idArray = data?.map((post) => post.id) || []
    return idArray
  } catch (err) {
    throw formatAxiosError(err)
  }
}

const updatePostStatus = async (postIds) => {
  // build payload
  let updatePayload = {
    query: `
        mutation UpdatePosts($data: [PostUpdateArgs!]!) {
          updatePosts(data: $data) {
            id
            status
          }
        }
      `,
    variables: {
      data: [],
    },
  }
  postIds.forEach((postId) => {
    updatePayload.variables.data.push({
      where: {
        id: postId,
      },
      data: {
        status: 'published',
      },
    })
  })

  // update post status
  try {
    console.log(
      JSON.stringify({
        severity: 'INFO',
        message: `Update post ${postIds} status to published.`,
      })
    )
    const token = await tokenManager.getToken()
    const update = await axios.post(config.apiUrl, updatePayload, {
      withCredentials: true,
      headers: {
        Cookie: `keystonejs-session=${token}`,
      },
    })
    if (update?.data?.errors) {
      const annotatedErr = errors.helpers.wrap(
        new Error(update?.data?.errors[0]?.message),
        'updatePostsError',
        'Error updating post status',
        {
          postIds: postIds,
          errors: update?.data?.errors,
        }
      )
      throw annotatedErr
    }
  } catch (err) {
    throw formatAxiosError(err)
  }
}

const main = async () => {
  try {
    const scheduledPosts = await getScheduledPosts()
    if (scheduledPosts.length === 0) {
      console.log(
        JSON.stringify({
          severity: 'INFO',
          message: 'No scheduled posts.',
        })
      )
    } else {
      console.log(
        JSON.stringify({
          severity: 'INFO',
          message: `Scheduled posts: ${scheduledPosts}`,
        })
      )
      await updatePostStatus(scheduledPosts)
    }
  } catch (err) {
    errorHandling(err)
  }
  console.log(
    JSON.stringify({
      severity: 'NOTICE',
      message: 'Cronjob scheduled-post completed.',
    })
  )
}

main()
