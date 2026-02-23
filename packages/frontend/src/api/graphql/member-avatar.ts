import gql from 'graphql-tag'

export const CREATE_MEMBER_AVATAR_MUTATION = gql`
  mutation CreateMemberAvatar($data: MemberAvatarCreateInput!) {
    item: createMemberAvatar(data: $data) {
      id
      name
    }
  }
`
