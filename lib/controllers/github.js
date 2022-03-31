const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GithubUser = require('../models/GithubUser');
const { exchangeCodeForToken, getGithubProfile } = require('../utils/github');
const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .get('/login', async (req, res) => {
    // TODO: Kick-off the github oauth flow
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user&redirect_uri=${process.env.REDIRECT_URI}`
    );
  })
  .get('/login/callback', async (req, res) => {
    const { code } = req.query;
    // console.log('!!', code);
    const token = await exchangeCodeForToken(code);
    // console.log('token!!!', token);
    const { login, avatar_url, email } = await getGithubProfile(token);
    // console.log(login, avatar_url, email);

    let user = await GithubUser.findByUsername(login);

    if (!user) {
      user = await GithubUser.insert({
        username: login,
        email,
        avatar: avatar_url,
      });
    }

    // console.log(user);
    const payload = await jwt.sign(
      await user.toJSON(),
      process.env.JWT_SECRET,
      {
        expiresIn: '1 day',
      }
    );

    res
      .cookie(process.env.COOKIE_NAME, payload, {
        httpOnly: true,
        maxAge: ONE_DAY_IN_MS,
      })
      .redirect('/api/v1/github/dashboard');
    // console.log('!!!!!!', login, avatar_url, email);
    /*
      TODO:
     * get code
     * exchange code for token
     * get info from github about user with token
     * get existing user if there is one
     * if not, create one
     * create jwt
     * set cookie and redirect
     */
  })
  .get('/dashboard', authenticate, async (req, res) => {
    // require req.user
    // get data about user and send it as json
    res.json(req.user);
  })
  .delete('/sessions', (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME)
      .json({ success: true, message: 'Signed out successfully!' });
  });
