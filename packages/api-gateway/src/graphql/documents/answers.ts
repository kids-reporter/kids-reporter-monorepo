import gql from 'graphql-tag'

export const GET_POST_CHOICE_ANSWERS_QUERY = gql`
  query GetPostChoiceAnswers($where: PostChoiceAnswerWhereInput!) {
    postChoiceAnswers(where: $where) {
      id
      question {
        id
      }
      member {
        id
      }
      choiceIndex
      correct
    }
  }
`

export const CREATE_POST_CHOICE_ANSWER_MUTATION = gql`
  mutation CreatePostChoiceAnswer($data: PostChoiceAnswerCreateInput!) {
    createPostChoiceAnswer(data: $data) {
      question {
        id
      }
      choiceIndex
      correct
    }
  }
`

export const UPDATE_POST_CHOICE_ANSWER_MUTATION = gql`
  mutation UpdatePostChoiceAnswer(
    $id: ID!
    $data: PostChoiceAnswerUpdateInput!
  ) {
    updatePostChoiceAnswer(where: { id: $id }, data: $data) {
      id
      choiceIndex
      correct
    }
  }
`

export const GET_POST_ESSAY_ANSWERS_QUERY = gql`
  query GetPostEssayAnswers($where: PostEssayAnswerWhereInput!) {
    postEssayAnswers(where: $where) {
      id
      question {
        id
      }
      member {
        id
      }
      content
    }
  }
`

export const GET_ALL_POST_ESSAY_ANSWERS_QUERY = gql`
  query GetAllPostEssayAnswers(
    $orderBy: [PostEssayAnswerOrderByInput!]!
    $take: Int
  ) {
    postEssayAnswers(orderBy: $orderBy, take: $take) {
      id
      createdAt
      question {
        id
        post {
          slug
        }
        title
      }
      member {
        id
        avatar {
          fileUrl
        }
        nickname
        name
        email
      }
      content
      likesCount
    }
  }
`

export const CREATE_POST_ESSAY_ANSWER_MUTATION = gql`
  mutation CreatePostEssayAnswer($data: PostEssayAnswerCreateInput!) {
    createPostEssayAnswer(data: $data) {
      question {
        id
      }
      content
    }
  }
`

export const UPDATE_POST_ESSAY_ANSWER_MUTATION = gql`
  mutation UpdatePostEssayAnswer($id: ID!, $data: PostEssayAnswerUpdateInput!) {
    updatePostEssayAnswer(where: { id: $id }, data: $data) {
      id
      content
    }
  }
`

export const GET_ESSAY_QUESTION_ESSAY_ANSWERS_QUERY = gql`
  query GetEssayQuestionEssayAnswers(
    $where: PostEssayQuestionWhereUniqueInput!
    $answerOrderBy: [PostEssayAnswerOrderByInput!]!
    $answerTake: Int!
    $answerSkip: Int
  ) {
    postEssayQuestion(where: $where) {
      id
      title
      hint
      answers(orderBy: $answerOrderBy, take: $answerTake, skip: $answerSkip) {
        id
        content
        member {
          id
          avatar {
            fileUrl
            id
          }
          name
          nickname
          email
        }
        likesCount
      }
    }
  }
`

export const CREATE_POST_ESSAY_ANSWER_LIKE_MUTATION = gql`
  mutation CreatePostEssayAnswerLike($data: PostEssayAnswerLikeCreateInput!) {
    createPostEssayAnswerLike(data: $data) {
      answer {
        id
      }
      member {
        id
      }
    }
  }
`

export const DELETE_POST_ESSAY_ANSWER_LIKE_MUTATION = gql`
  mutation DeletePostEssayAnswerLike(
    $where: PostEssayAnswerLikeWhereUniqueInput!
  ) {
    deletePostEssayAnswerLike(where: $where) {
      id
    }
  }
`
