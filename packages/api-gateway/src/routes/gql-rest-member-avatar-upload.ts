import { CREATE_MEMBER_AVATAR_MUTATION } from '../graphql/documents/members.js'
import { createMultipartRewriteHandler } from './gql-rest-multipart.js'

export const createMemberAvatarUploadHandler = ({
  apiOrigin,
}: {
  apiOrigin: string
}) =>
  createMultipartRewriteHandler({
    apiOrigin,
    operationName: 'CreateMemberAvatar',
    document: CREATE_MEMBER_AVATAR_MUTATION,
    map: { '1': ['variables.data.imageFile.upload'] },
    buildVariables: ({ name }) => ({
      data: {
        name,
        imageFile: { upload: null },
      },
    }),
  })
