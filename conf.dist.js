module.exports = {
  ENV: 'production',
  COOKIE_KEY: 'jira-cookie-key',
  STATIC_PATH: './public',
  STATIC_ROUTE: '/',
  SERVER_PORT: '5000',
  JIRA: {
    host: 'jira.xyzxyzxyz.net',
    group: 'developers',
    fields: ['components', 'customfield_10000', 'summary']
  }
}
