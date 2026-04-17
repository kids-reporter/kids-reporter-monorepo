import gql from 'graphql-tag'

import { POST_CONTENT_FRAGMENT } from './shared.js'

export const GET_LATEST_POSTS_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetLatestPosts($orderBy: [PostOrderByInput!]!, $take: Int) {
    posts(orderBy: $orderBy, take: $take) {
      ...PostContent
    }
  }
`

export const GET_EDITOR_PICKS_SETTINGS_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetEditorPicksSettings($take: Int) {
    editorPicksSettings(take: $take) {
      id
      editorPicksOfPostsOrdered {
        ...PostContent
      }
      editorPicksOfTags {
        name
        slug
      }
      popularKeywordsOrdered {
        name
      }
    }
  }
`

// only take the first editor picks setting
export const GET_POPULAR_KEYWORDS_QUERY = gql`
  query GetPopularKeywords {
    editorPicksSettings(take: 1) {
      popularKeywordsOrdered {
        name
      }
    }
  }
`

export const GET_CALL_BAODAOZAI_INTRO_QUERY = gql`
  query GetCallBaodaozaiIntro($where: CallBaodaozaiIntroWhereUniqueInput!) {
    callBaodaozaiIntro(where: $where) {
      id
      page
      content
    }
  }
`

export const GET_CATEGORY_POSTS_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetCategoryPosts(
    $where: CategoryWhereUniqueInput!
    $take: Int
    $skip: Int
  ) {
    category(where: $where) {
      relatedPosts(take: $take, skip: $skip) {
        ...PostContent
      }
      relatedPostsCount
    }
  }
`

export const GET_CATEGORY_METADATA_QUERY = gql`
  query GetCategoryMetadata(
    $categoryWhere: CategoryWhereUniqueInput!
    $subcategoryWhere: SubcategoryWhereInput!
  ) {
    category(where: $categoryWhere) {
      ogTitle
      ogDescription
      ogImage {
        resized {
          medium
        }
      }
      subcategories(where: $subcategoryWhere) {
        ogTitle
        ogDescription
        ogImage {
          resized {
            medium
          }
        }
      }
    }
  }
`

export const GET_CATEGORY_SUBCATEGORIES_AND_THEME_COLOR_QUERY = gql`
  query GetCategorySubcategoriesAndThemeColor(
    $where: CategoryWhereUniqueInput!
  ) {
    category(where: $where) {
      name
      subcategories {
        name
        slug
      }
      themeColor
    }
  }
`

export const GET_SUBCATEGORY_POSTS_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetSubcategoryPosts(
    $where: SubcategoryWhereUniqueInput!
    $take: Int
    $skip: Int
  ) {
    subcategory(where: $where) {
      relatedPosts(take: $take, skip: $skip) {
        ...PostContent
      }
      relatedPostsCount
      category {
        slug
      }
    }
  }
`

export const GET_SUB_SUBCATEGORY_POSTS_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetSubSubcategoryPosts(
    $where: SubSubcategoryWhereUniqueInput!
    $take: Int
    $skip: Int
    $orderBy: [PostOrderByInput!]!
  ) {
    subSubcategory(where: $where) {
      relatedPosts(take: $take, skip: $skip, orderBy: $orderBy) {
        ...PostContent
      }
      relatedPostsCount
      subcategory {
        slug
        category {
          slug
        }
      }
    }
  }
`

export const GET_TOPIC_PROJECTS_QUERY = gql`
  query GetTopicProjects($orderBy: [ProjectOrderByInput!]!, $take: Int) {
    projects(orderBy: $orderBy, take: $take) {
      title
      subtitle
      slug
      heroImage {
        resized {
          small
        }
      }
    }
  }
`

export const GET_POST_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetPost(
    $where: PostWhereUniqueInput!
    $orderBy: [NewsReadingGroupItemOrderByInput!]!
    $take: Int
    $relatedPostsWhere: PostWhereInput!
    $postEssayQuestionsTake: Int
    $postChoiceQuestionsTake: Int
  ) {
    post(where: $where) {
      opening
      title
      showBaodaozai
      newsReadingGroup {
        items(orderBy: $orderBy) {
          name
          embedCode
        }
      }
      brief
      content
      publishedDate
      heroImage {
        imageFile {
          width
          height
        }
        resized {
          small
          medium
          large
        }
      }
      heroCaption
      authors {
        avatar {
          resized {
            tiny
          }
        }
        bio
        id
        name
        slug
      }
      authorsJSON
      tagsOrdered {
        name
        slug
      }
      TWReporterRelatedPostsJSON
      relatedPostsOrdered {
        title
        slug
        publishedDate
        heroImage {
          resized {
            small
            medium
            large
          }
        }
        ogDescription
        subSubcategoriesOrdered {
          name
          slug
          subcategory {
            name
            slug
            category {
              name
              slug
              themeColor
            }
          }
        }
      }
      subtitle
      subSubcategoriesOrdered {
        name
        slug
        subcategory {
          name
          slug
          category {
            name
            slug
            themeColor
          }
        }
      }
      mainProject {
        title
        slug
      }
      projects {
        title
        slug
        relatedPosts(take: $take, where: $relatedPostsWhere) {
          ...PostContent
        }
      }
      postEssayQuestions(take: $postEssayQuestionsTake) {
        id
        title
        hint
      }
      postChoiceQuestions(take: $postChoiceQuestionsTake) {
        id
        title
        options
        reason
      }
    }
  }
`

export const GET_POST_META_QUERY = gql`
  query GetPostMeta($where: PostWhereUniqueInput!) {
    post(where: $where) {
      publishedDate
      ogDescription
      ogTitle
      ogImage {
        resized {
          small
        }
      }
      subSubcategoriesOrdered {
        name
        slug
        subcategory {
          name
          slug
          category {
            name
            slug
            themeColor
          }
        }
      }
    }
  }
`

export const GET_POSTS_COUNT_QUERY = gql`
  query PostsCount {
    postsCount
  }
`

export const GET_POSTS_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetPosts($orderBy: [PostOrderByInput!]!, $take: Int, $skip: Int) {
    posts(orderBy: $orderBy, take: $take, skip: $skip) {
      ...PostContent
    }
  }
`

export const GET_POSTS_ESSAY_ANSWERS_WITH_LIKES_QUERY = gql`
  query GetPostsEssayAnswersWithLikes(
    $orderBy: [PostOrderByInput!]!
    $take: Int
    $skip: Int
    $answerOrderBy: [PostEssayAnswerOrderByInput!]!
    $answerTake: Int
    $where: PostWhereInput!
  ) {
    posts(orderBy: $orderBy, take: $take, skip: $skip, where: $where) {
      id
      title
      slug
      heroImage {
        resized {
          medium
        }
      }
      subSubcategoriesOrdered {
        name
      }
      postEssayQuestions {
        id
        title
        hint
        answers(orderBy: $answerOrderBy, take: $answerTake) {
          id
          content
          member {
            id
            avatar {
              id
              fileUrl
            }
            name
            nickname
            email
          }
          likesCount
        }
      }
    }
  }
`

export const GET_POST_ESSAY_QUESTIONS_QUERY = gql`
  query GetPostEssayQuestions($where: PostWhereUniqueInput!) {
    post(where: $where) {
      id
      slug
      title
      heroImage {
        resized {
          medium
        }
      }
      postEssayQuestions {
        id
        title
        hint
      }
      subSubcategoriesOrdered {
        name
      }
    }
  }
`

export const GET_TAG_POSTS_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetTagPosts(
    $where: TagWhereUniqueInput!
    $take: Int
    $skip: Int
    $orderBy: [PostOrderByInput!]!
  ) {
    tag(where: $where) {
      posts(orderBy: $orderBy, take: $take, skip: $skip) {
        ...PostContent
      }
      postsCount
      name
    }
  }
`

export const GET_TAG_META_QUERY = gql`
  query GetTagMeta($where: TagWhereUniqueInput!) {
    tag(where: $where) {
      ogDescription
      ogTitle
      ogImage {
        resized {
          small
        }
      }
    }
  }
`

export const GET_PROJECT_QUERY = gql`
  query GetProject($where: ProjectWhereUniqueInput!) {
    project(where: $where) {
      title
      titlePosition
      subtitle
      content
      credits
      publishedDate
      heroImage {
        resized {
          small
          medium
          large
        }
      }
      mobileHeroImage {
        resized {
          small
          medium
          large
        }
      }
      relatedPostsOrdered {
        title
        slug
        publishedDate
        heroImage {
          resized {
            small
            medium
            large
          }
        }
        ogDescription
        subSubcategoriesOrdered {
          name
          slug
          subcategory {
            name
            slug
            category {
              name
              slug
              themeColor
            }
          }
        }
      }
    }
  }
`

export const GET_PROJECT_META_QUERY = gql`
  query GetProjectMeta($where: ProjectWhereUniqueInput!) {
    project(where: $where) {
      publishedDate
      ogDescription
      ogTitle
      ogImage {
        resized {
          small
        }
      }
    }
  }
`

export const GET_PROJECTS_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetProjects(
    $orderBy: [ProjectOrderByInput!]!
    $take: Int
    $skip: Int
    $includeRelatedPosts: Boolean = false
  ) {
    projects(orderBy: $orderBy, take: $take, skip: $skip) {
      title
      slug
      ogDescription
      heroImage {
        resized {
          medium
        }
      }
      publishedDate
      relatedPostsOrdered @include(if: $includeRelatedPosts) {
        ...PostContent
      }
    }
    projectsCount
  }
`

export const GET_PROJECT_RELATED_POSTS_COUNT_QUERY = gql`
  query GetProjectRelatedPostsCount($where: ProjectWhereUniqueInput!) {
    project(where: $where) {
      relatedPostsCount
    }
  }
`

export const GET_AUTHOR_POSTS_QUERY = gql`
  ${POST_CONTENT_FRAGMENT}
  query GetAuthorPosts(
    $where: AuthorWhereUniqueInput!
    $take: Int
    $skip: Int
    $orderBy: [PostOrderByInput!]!
  ) {
    author(where: $where) {
      bio
      name
      email
      avatar {
        resized {
          tiny
        }
      }
      posts(orderBy: $orderBy, take: $take, skip: $skip) {
        ...PostContent
      }
      postsCount
    }
  }
`

export const GET_AUTHOR_META_QUERY = gql`
  query GetAuthorMeta($where: AuthorWhereUniqueInput!) {
    author(where: $where) {
      slug
      name
      bio
      image {
        resized {
          small
        }
      }
    }
  }
`

export const GET_AUTHOR_AVATAR_QUERY = gql`
  query GetAuthorAvatar($where: AuthorWhereUniqueInput!) {
    author(where: $where) {
      avatar {
        resized {
          tiny
        }
      }
    }
  }
`

export const GET_AUTHOR_POSTS_COUNT_QUERY = gql`
  query GetAuthorPostsCount($where: AuthorWhereUniqueInput!) {
    author(where: $where) {
      postsCount
    }
  }
`

export const GET_POSTS_FOR_SITEMAP_QUERY = gql`
  query GetPostsForSitemap($where: PostWhereInput!) {
    posts(where: $where) {
      slug
      publishedDate
    }
  }
`

export const GET_PROJECTS_FOR_SITEMAP_QUERY = gql`
  query GetProjectsForSitemap($where: ProjectWhereInput!) {
    projects(where: $where) {
      slug
      publishedDate
    }
  }
`

export const GET_SUBCATEGORIES_QUERY = gql`
  query GetSubcategories {
    subcategories {
      id
      name
      slug
      category {
        slug
      }
    }
  }
`
