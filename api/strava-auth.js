export default async function handler(req, res) {
  const { code } = req.query;
  const client_id = process.env.STRAVA_CLIENT_ID;
  const client_secret = process.env.STRAVA_CLIENT_SECRET;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const redirect_uri = `${proto}://${host}/api/strava-auth`;

  if (!code) {
    // Step 1: Redirect user to Strava OAuth
    const url = `https://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=read,activity:read`;
    res.writeHead(302, { Location: url });
    res.end();
    return;
  }

  // Step 2: Exchange code for token
  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id,
      client_secret,
      code,
      grant_type: 'authorization_code',
      redirect_uri
    })
  });
  const tokenData = await tokenRes.json();

  // Redirect to frontend with token (or error)
  if (tokenData.access_token) {
    res.writeHead(302, { Location: `/?access_token=${tokenData.access_token}` });
    res.end();
  } else {
    res.writeHead(302, { Location: `/?error=strava_auth_failed` });
    res.end();
  }
}
