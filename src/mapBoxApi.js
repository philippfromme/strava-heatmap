import mapboxgl from 'mapbox-gl/dist/mapbox-gl-dev';

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

import { toGeoJSON } from '@mapbox/polyline';

const COLOR_BLUE = '#0000ff',
      COLOR_ORANGE = '#fc5200';

const LAYER_ID = 'strava',
      SOURCE_ID = 'strava';

let map;

export async function setUpMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/philippfromme/ckdum91f71b3k19nxrc6ki8sb', // Monochrome dark
    // style: 'mapbox://styles/philippfromme/ckdvvv1gz2ipm1aorbpcunsot', // Monochrome light
    center: [13.424746, 52.507208],
    zoom: 10
  });

  return new Promise(resolve => {
    map.on('load', () => {
      resolve();
    });
  });
}

export function showActivitiesOnMap(activities) {
  const activitiesGeoJSON = activities
      .map(({ map }) => map.summary_polyline)
      .filter(polyline => polyline)
      .map(polyline => toGeoJSON(polyline));

  const data = toFeatureCollection(activitiesGeoJSON);

  if (!map.getLayer(LAYER_ID)) {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data
    });

    map.addLayer({
      id: LAYER_ID,
      type: 'line',
      source: SOURCE_ID,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': COLOR_ORANGE,
        'line-width': 3
      }
    });
  } else {
    map.getSource(SOURCE_ID).setData(data);
  }

}

function toFeatureCollection(activitiesGeoJSON) {
  const features = activitiesGeoJSON.map(({ coordinates }) => {
    return {
      type: 'Feature',
      properties: {
        color: COLOR_ORANGE
      },
      geometry: {
        type: 'LineString',
        coordinates
      }
    };
  });

  return {
    type: 'FeatureCollection',
    features
  };
}