const { topology } = require('topojson-server');
const { simplify, presimplify, quantile } = require('topojson-simplify');
const config = require('./config.json');
const map = require(config.posts + '/map.json');
const locations = require(config.posts + '/locations.json');

const topo = topology({ route: toGeoJSON(locations) });
const presimplified = presimplify(topo);
const simplified = simplify(presimplified, quantile(presimplified, 0.1));

module.exports = JSON.stringify({
    map,
    route: simplified,
});

function toGeoJSON(route) {
    return {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: route.map(point => point.p),
                },
            },
        ],
    };
}
