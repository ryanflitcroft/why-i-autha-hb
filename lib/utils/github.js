const fetch = require('cross-fetch');

const exchangeCodeForToken = async (code) => {
  const client_id = process.env.client_id;
  const client_secret = process.env.client_secret;
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      code,
    }),
  });

  const { access_token } = await response.json();
  return access_token;
};

const getGithubProfile = async (token) => {
  // TODO: Implement me!
  const response = await fetch('https://api.github.com/user', {
    Authorization: token`${token}`,
    Accept: 'application/vnd.github.v3+json',
  });

  return response.json();
};

module.exports = { exchangeCodeForToken, getGithubProfile };
