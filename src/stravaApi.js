export async function getActivities() {
  const access_token = await getAccessToken();

  let allActivities = [],
      activities = [],
      page = 1;

  do {
    const url = `https://www.strava.com/api/v3/athlete/activities?access_token=${ access_token }&page=${ page }&per_page=${ 200 }`;

    const response = await fetch(url);

    activities = await response.json();

    allActivities = [
      ...allActivities,
      ...activities
    ];

    page++;
  } while(activities.length);

  return allActivities;
}

export async function exchangeToken(authorizationCode) {
  const url = `https://www.strava.com/oauth/token?client_id=${ process.env.CLIENT_ID }&client_secret=${ process.env.CLIENT_SECRET }&code=${ authorizationCode }&grant_type=authorization_code`;

  const response = await fetch(url, {
    method: 'POST'
  });

  console.log('response', response);

  const json = await response.json();

  console.log('json', json);

  return json.refresh_token;
}

export async function getAccessToken() {
  const url = 'https://www.strava.com/oauth/token';

  const headers = new Headers();

  headers.append('Accept', 'application/json, text/plain, */*');
  headers.append('Content-Type', 'application/json');

  const refreshToken = getRefreshToken();

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const json = await response.json();

  const { access_token } = json;

  return access_token;
}

export function getRefreshToken() {
  return sessionStorage.getItem('strava-custom-heatmap-refresh-token');
}

export function isAuthorized() {
  return getRefreshToken() !== null;
}

export function setRefreshToken(refreshToken) {
  return sessionStorage.setItem('strava-custom-heatmap-refresh-token', refreshToken);
}