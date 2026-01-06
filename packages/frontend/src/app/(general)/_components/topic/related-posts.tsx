'use client'
import styled from 'styled-components'

import PostCard from '@/components/post-card'
import { PostSummary } from '@/components/types'
import { mediaQuery } from '@/utils/media-query'

const FlexContainer = styled.div`
  /* flexbox related styles */
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  row-gap: 45px;
  column-gap: 40px;
  flex-wrap: wrap;
  margin: 0 auto 120px auto;

  ${mediaQuery.mediumAbove} {
    max-width: 1200px;
  }
`

const StyledPostCard = styled(PostCard)`
  /* reset PostCard styles */
  max-width: 360px;
  margin-left: 0;
  margin-right: 0;
`

export const RelatedPosts = ({ posts = [] }: { posts: PostSummary[] }) => {
  if (!Array.isArray(posts) || posts?.length === 0) {
    return null
  }

  const postCards = posts.map((post, idx) => (
    <StyledPostCard key={idx} post={post} isSimple={post.desc === ''} />
  ))

  return <FlexContainer>{postCards}</FlexContainer>
}

export default RelatedPosts
