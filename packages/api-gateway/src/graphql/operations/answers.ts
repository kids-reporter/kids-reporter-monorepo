import {
  CREATE_POST_CHOICE_ANSWER_MUTATION,
  CREATE_POST_ESSAY_ANSWER_LIKE_MUTATION,
  CREATE_POST_ESSAY_ANSWER_MUTATION,
  DELETE_POST_ESSAY_ANSWER_LIKE_MUTATION,
  GET_ALL_POST_ESSAY_ANSWERS_QUERY,
  GET_ESSAY_QUESTION_ESSAY_ANSWERS_QUERY,
  GET_POST_CHOICE_ANSWERS_QUERY,
  GET_POST_ESSAY_ANSWERS_QUERY,
  UPDATE_POST_CHOICE_ANSWER_MUTATION,
  UPDATE_POST_ESSAY_ANSWER_MUTATION,
} from '../documents/answers.js'
import { ensureRecord, normalizeOrderBy, Operation, toInt } from './shared.js'

export const operations: Record<string, Operation> = {
  'post-choice-answers': {
    method: 'GET',
    auth: 'auth',
    operationName: 'GetPostChoiceAnswers',
    document: GET_POST_CHOICE_ANSWERS_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'create-post-choice-answer': {
    method: 'POST',
    auth: 'auth',
    operationName: 'CreatePostChoiceAnswer',
    document: CREATE_POST_CHOICE_ANSWER_MUTATION,
    buildVariables: (input) => {
      return { data: ensureRecord(input.data, 'Missing data') }
    },
  },
  'update-post-choice-answer': {
    method: 'POST',
    auth: 'auth',
    operationName: 'UpdatePostChoiceAnswer',
    document: UPDATE_POST_CHOICE_ANSWER_MUTATION,
    buildVariables: (input) => {
      const id = input.id
      if (typeof id !== 'string') {
        throw new Error('Missing id')
      }
      return { id, data: ensureRecord(input.data, 'Missing data') }
    },
  },
  'post-essay-answers': {
    method: 'GET',
    auth: 'auth',
    operationName: 'GetPostEssayAnswers',
    document: GET_POST_ESSAY_ANSWERS_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'all-post-essay-answers': {
    method: 'GET',
    cacheTtl: 60,
    auth: 'public',
    maskEmails: true,
    operationName: 'GetAllPostEssayAnswers',
    document: GET_ALL_POST_ESSAY_ANSWERS_QUERY,
    buildVariables: (input) => {
      return {
        orderBy: normalizeOrderBy(input.orderBy, [{ createdAt: 'desc' }]),
        take: toInt(input.take),
      }
    },
  },
  'create-post-essay-answer': {
    method: 'POST',
    auth: 'auth',
    operationName: 'CreatePostEssayAnswer',
    document: CREATE_POST_ESSAY_ANSWER_MUTATION,
    buildVariables: (input) => {
      return { data: ensureRecord(input.data, 'Missing data') }
    },
  },
  'update-post-essay-answer': {
    method: 'POST',
    auth: 'auth',
    operationName: 'UpdatePostEssayAnswer',
    document: UPDATE_POST_ESSAY_ANSWER_MUTATION,
    buildVariables: (input) => {
      const id = input.id
      if (typeof id !== 'string') {
        throw new Error('Missing id')
      }
      return { id, data: ensureRecord(input.data, 'Missing data') }
    },
  },
  'post-essay-question-answers': {
    method: 'GET',
    auth: 'public',
    maskEmails: true,
    operationName: 'GetEssayQuestionEssayAnswers',
    document: GET_ESSAY_QUESTION_ESSAY_ANSWERS_QUERY,
    buildVariables: (input) => {
      const answerTake = toInt(input.answerTake)
      if (typeof answerTake !== 'number') {
        throw new Error('Missing required variable: answerTake')
      }
      return {
        where: ensureRecord(input.where, 'Missing where'),
        answerOrderBy: normalizeOrderBy(input.answerOrderBy, [
          { createdAt: 'desc' },
        ]),
        answerTake,
        answerSkip: toInt(input.answerSkip),
      }
    },
  },
  'create-post-essay-answer-like': {
    method: 'POST',
    auth: 'auth',
    operationName: 'CreatePostEssayAnswerLike',
    document: CREATE_POST_ESSAY_ANSWER_LIKE_MUTATION,
    buildVariables: (input) => {
      return { data: ensureRecord(input.data, 'Missing data') }
    },
  },
  'delete-post-essay-answer-like': {
    method: 'POST',
    auth: 'auth',
    operationName: 'DeletePostEssayAnswerLike',
    document: DELETE_POST_ESSAY_ANSWER_LIKE_MUTATION,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
}
