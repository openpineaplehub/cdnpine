import { Octokit } from '@octokit/rest';

async function checkToken(token) {
  const octokit = new Octokit({ auth: token });
  try {
    const res = await octokit.request('GET /', {});
    console.log('Authenticated as:', res.data.login || res.data);
    console.log('Token scopes:', res.headers['x-oauth-scopes']);
  } catch (e) {
    console.error('Token validation failed:', e.message);
  }
}

checkToken('YOUR_TOKEN_HERE');
