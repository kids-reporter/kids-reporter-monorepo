export const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3001/api/graphql',

  // rss
  baseUrl: process.env.BASE_URL || 'http://localhost:3001/',
  bucketName: process.env.BUCKET_NAME || 'dev-kids-storage.twreporter.org',
  slackLogHook: process.env.SLACK_LOG_HOOK,
  rssFileName: process.env.RSS_FILE_NAME || 'rss/rss.xml',
  rssFetchDays: process.env.RSS_FETCH_DAYS || 7,
  rss: {
    title: '少年報導者 The Reporter for Kids - 理解世界 參與未來',
    description:
      '《少年報導者》是由非營利媒體《報導者》針對兒少打造的深度新聞報導品牌，與兒童和少年一起理解世界，參與未來。',
    language: 'zh-tw',
    image_url: 'https://kids-storage.twreporter.org/logo.png',
  },
  gcs: {
    projectId: process.env.PROJECT_ID || '',
    keyFilename: process.env.KEY_FILENAME || '',
  },

  cronjobAccount: {
    email: process.env.CRONJOB_ACCOUNT_EMAIL,
    password: process.env.CRONJOB_ACCOUNT_PASSWORD,
  },
}
