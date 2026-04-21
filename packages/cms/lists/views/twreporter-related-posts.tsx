import { controller } from '@keystone-6/core/fields/types/virtual/views'
import { FieldProps } from '@keystone-6/core/types'
import { Button } from '@keystone-ui/button'
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields'
import {
  CornerUpRightIcon,
  PlusCircleIcon,
  SearchIcon,
  TrashIcon,
} from '@keystone-ui/icons'
import { Tooltip } from '@keystone-ui/tooltip'
import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'
import styled, { css } from 'styled-components'

type TWReporterPost = {
  src: string
  ogImgSrc: string | null
  ogTitle: string | null
  ogDescription: string | null
  publishedDate: string | null
  subcategory: string | null
  category: string | null
}

type PostTag = {
  id: string
  label: string
}

const AuthorContainer = styled.div`
  flex: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: 15px;
`

const IconButton = styled(Button)<{ $disabled?: boolean }>`
  background-color: transparent;
  margin: 0 0 0 0.5rem;
  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
    `}
`

const DndItem = styled.div`
  userselect: 'none';
  padding: 5px;
  margin: 0 0 5px 0;
  border: 1px solid lightgrey;
  border-radius: 5px;
`

const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`

const SearchResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #f9f9f9;
`

const SearchResultItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const SearchTWReporterPostsQuery = `
query SearchTWReporterPosts($keywords: String!) {
  searchTWReporterPosts(keywords: $keywords) {
   src
   ogImgSrc
   ogTitle
   ogDescription
   publishedDate
   subcategory
   category
  }
}
`

const PostComponent = (props: {
  index: number
  post: TWReporterPost
  actionElement: ReactNode
}) => {
  const post = props.post
  return (
    post && (
      <AuthorContainer>
        {`${props.index}.`}
        <img width="100px" src={post.ogImgSrc ?? ''} />
        <div style={{ flex: '2' }}>{post.ogTitle}</div>
        <a href={post.src} target="_blank" rel="noreferrer">
          <CornerUpRightIcon size="small" />
        </a>
        {props.actionElement}
      </AuthorContainer>
    )
  )
}

const selectedTagsNum = 3
const selectedPostsNum = 6

export const Field = ({
  field,
  value,
  onChange,
  itemValue,
}: FieldProps<typeof controller>) => {
  const relatedPosts: TWReporterPost[] = value ? JSON.parse(value) : []

  const tags =
    (
      itemValue as {
        tags: { value: { value: PostTag[] } }
      }
    ).tags.value.value || []

  const [searchInput, setSearchInput] = useState<string>(
    tags
      .filter((_tag, index: number) => index < selectedTagsNum)
      .map(({ label }) => label)
      .join('|')
  )
  const [searchResults, setSearchResults] = useState<TWReporterPost[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const onDeletePost = (index: number) => {
    if (onChange && index >= 0 && index < relatedPosts.length) {
      const newRelatedPosts = [...relatedPosts]
      newRelatedPosts.splice(index, 1)
      onChange(JSON.stringify(newRelatedPosts))
    }
  }

  const reorderPost = (
    posts: TWReporterPost[],
    startIndex: number,
    endIndex: number
  ) => {
    const result = Array.from(posts)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    if (onChange) {
      const newRelatedPosts = reorderPost(
        relatedPosts,
        result.source.index,
        result.destination.index
      )
      onChange(JSON.stringify(newRelatedPosts))
    }
  }

  const searchRelatedPosts = useCallback(
    async (keywords: string): Promise<TWReporterPost[]> => {
      if (!keywords.trim()) {
        return []
      }

      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: SearchTWReporterPostsQuery,
            variables: { keywords },
          }),
        })

        const result = await response.json()

        if (result.errors) {
          console.error('GraphQL errors:', result.errors)
          return []
        }

        return (
          result.data?.searchTWReporterPosts.slice(0, selectedPostsNum) || []
        )
      } catch (e) {
        console.log('Search posts failed!', e)
        return []
      }
    },
    []
  )

  const handleSearch = useCallback(async () => {
    if (!searchInput.trim()) return

    setIsSearching(true)
    const posts = await searchRelatedPosts(searchInput)
    setSearchResults(posts ?? [])
    setIsSearching(false)
  }, [searchInput, searchRelatedPosts])

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.currentTarget.value)
  }

  const handleSearchKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      await handleSearch()
    }
  }

  const handleAddFromSearch = (post: TWReporterPost) => {
    if (onChange) {
      const newRelatedPosts = [...relatedPosts, post]
      onChange(JSON.stringify(newRelatedPosts))
    }
  }

  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderPostsDnd = (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {relatedPosts.map((post: TWReporterPost, index: number) => {
              return (
                <Draggable key={post.src} draggableId={post.src} index={index}>
                  {(provided) => (
                    <DndItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <PostComponent
                        index={index + 1}
                        post={post}
                        actionElement={
                          <IconButton
                            size="small"
                            onClick={() => onDeletePost(index)}
                          >
                            <TrashIcon size="small" />
                          </IconButton>
                        }
                      />
                    </DndItem>
                  )}
                </Draggable>
              )
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )

  const renderSearch = (
    <SearchContainer>
      <TextInput
        value={searchInput}
        placeholder="輸入關鍵字搜尋報導者文章..."
        onChange={handleSearchInputChange}
        onKeyDown={handleSearchKeyDown}
      />
      <Tooltip content="搜尋">
        {(props) => (
          <Button {...props} onClick={handleSearch}>
            <SearchIcon size="small" />
          </Button>
        )}
      </Tooltip>
    </SearchContainer>
  )

  const renderSearchResults = searchResults.length > 0 && (
    <SearchResultsContainer>
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
        搜尋結果 ({searchResults.length} 個)：
      </div>
      {searchResults.map((post, index) => {
        const isPostAlreadyAdded = relatedPosts.some((p) => p.src === post.src)
        return (
          <SearchResultItem key={post.src}>
            <span>{index + 1}.</span>
            <img
              width="60px"
              src={post.ogImgSrc ?? ''}
              alt={post.ogTitle ?? ''}
            />
            <div style={{ flex: '2', fontSize: '14px' }}>{post.ogTitle}</div>
            <a href={post.src} target="_blank" rel="noreferrer">
              <CornerUpRightIcon size="small" />
            </a>
            <Tooltip content={isPostAlreadyAdded ? '已加入' : '直接新增'}>
              {(props) => (
                <IconButton
                  {...props}
                  size="small"
                  onClick={() => handleAddFromSearch(post)}
                  disabled={isPostAlreadyAdded}
                  $disabled={isPostAlreadyAdded}
                >
                  <PlusCircleIcon size="small" />
                </IconButton>
              )}
            </Tooltip>
          </SearchResultItem>
        )
      })}
    </SearchResultsContainer>
  )

  const renderLoading = isSearching && (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px',
      }}
    >
      {'搜尋中...'}
      <img
        style={{ width: '60px', height: '40px' }}
        src="/typing-texting.gif"
        alt="Loading"
      />
    </div>
  )

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {renderSearch}
      {renderLoading}
      {renderSearchResults}
      {renderPostsDnd}
    </FieldContainer>
  )
}
