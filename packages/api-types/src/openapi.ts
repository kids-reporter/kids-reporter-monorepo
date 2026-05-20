import './schemas/extra-openapi-paths.js'
import './schemas/qna.js'

import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'

import { registry } from './schemas/content.js'

const openApiRootTags = [
  { name: 'Infra', description: 'Health and service metadata.' },
  { name: 'Auth', description: 'Browser cookie exchange for Bearer JWT.' },
  { name: 'Posts', description: 'Articles and post-derived public feeds.' },
  { name: 'Projects', description: 'Topic / project listings and detail.' },
  {
    name: 'Taxonomy',
    description: 'Categories, tags, authors, and feed by slug.',
  },
  { name: 'Sitemaps', description: 'Sitemap entry lists.' },
  {
    name: 'Editor',
    description: 'Homepage editor picks and related settings.',
  },
  { name: 'Members', description: 'Authenticated member profile and avatar.' },
  {
    name: 'Member Q&A',
    description: 'Member-scoped choice/essay answers and likes.',
  },
  {
    name: 'Public Q&A',
    description: 'Public essay Q&A listings and question threads.',
  },
] as const

export function getOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  return {
    ...generator.generateDocument({
      openapi: '3.0.3',
      info: {
        title: 'Kids Reporter Content API',
        version: '0.0.1',
        description:
          'Content API: `GET /health`, `GET /docs` (Swagger UI; loads `GET /openapi.json`), `POST /auth/access-token` (cookie to JWT), and REST under `/v1/*`. The OpenAPI JSON is served at `GET /openapi.json` but is intentionally **not** listed as a path operation here. Authenticated member routes require `Authorization: Bearer <JWT>` (Go API–issued HS256; verify with `GO_API_JWT_SECRET`, `GO_API_JWT_ISSUER`, `GO_API_JWT_AUDIENCE`).',
      },
    }),
    tags: [...openApiRootTags],
  }
}
