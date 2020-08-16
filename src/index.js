import {
  exchangeToken,
  getActivities,
  isAuthorized,
  setRefreshToken
} from './stravaApi';

import {
  setUpMap,
  showActivitiesOnMap
} from './mapBoxApi';

const loaderOverlay = document.querySelector('.loader-overlay'),
      loginButton = document.querySelector('#login'),
      selectActivityTypeDropdown = document.querySelector('#select-activity-type');

let activities;

if (process.env.NODE_ENV === 'development') {
  window.clearRefreshToken = () => sessionStorage.removeItem('strava-custom-heatmap-refresh-token');

  // window.clearRefreshToken();
}

async function init() {
  showLoader();

  await setUpMap();

  // Is user authorized?
  if (isAuthorized()) {
    console.log('authorized');

    activities = await getActivities();

    setUpSelectActivityTypeDropdown(activities);

    selectActivityTypeDropdown.classList.remove('hidden');
  } else {

    // Is authorization code available?
    if (hasAuthorizationCode()) {
      console.log('not authorized, authorization code found');

      const authorizationCode = getAuthorizationCode();

      const refreshToken = await exchangeToken(authorizationCode);

      if (!refreshToken) {
        throw new Error('Could not authorize');
      }

      setRefreshToken(refreshToken);

      activities = await getActivities();

      setUpSelectActivityTypeDropdown(activities);

      selectActivityTypeDropdown.classList.remove('hidden');
    } else {
      console.log('not authorized, no authorization code found');

      let redirectUri;
  
      if (process.env.NODE_ENV === 'development') {
        redirectUri = 'http://localhost';
      } else {
        redirectUri = process.env.REDIRECT_URL;
      }
  
      loginButton.href =
      `https://www.strava.com/oauth/authorize?client_id=${ process.env.CLIENT_ID }&response_type=code&scope=activity:read_all&redirect_uri=${ redirectUri }`;

      loginButton.classList.remove('hidden');
    }
  }

  hideLoader();
}

init();

function setUpSelectActivityTypeDropdown(activities) {
  const types = activities.reduce((types, { type }) => {
    if (!types.includes(type)) {
      return [
        ...types,
        type
      ];
    }

    return types;
  }, []);

  types.forEach(type => {
    const anchor = document.createElement('a');

    anchor.href = '#';
    anchor.classList.add('dropdown-item');
    anchor.textContent = type;

    anchor.addEventListener('click', () => {
      selectActivityType(type);
    });

    selectActivityTypeDropdown.querySelector('.dropdown-menu').appendChild(anchor);
  });

  selectActivityTypeDropdown.querySelector('.dropdown-toggle').removeAttribute('disabled');
  
  selectActivityType(types[ 0 ]);
}

function selectActivityType(type) {
  selectActivityTypeDropdown.querySelector('.dropdown-toggle').textContent = type;

  showActivitiesOnMap(filterActivities(activities, type));
}

function filterActivities(activities, type) {
  return activities.filter(activity => activity.type === type);
}

function getAuthorizationCode() {
  return new URLSearchParams(window.location.search).get('code');
}

function hasAuthorizationCode() {
  return new URLSearchParams(window.location.search).has('code');
}

function showLoader() {
  loaderOverlay.classList.remove('hidden');
}

function hideLoader() {
  loaderOverlay.classList.add('hidden');
}