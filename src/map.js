import d3 from 'd3';
import * as topojson from 'topojson-client';
import _ from 'lodash';

import { articles } from './elements';
import mapString from 'raw!val!../map-provider.js';

const mapData = JSON.parse(mapString);
const subMap = articles[0].fixed.getElementsByTagName('svg')[1];

const map = {
    world: mapData.map,
    svg: d3.select('#map'),
    $stops: document.getElementsByClassName('stop'),
    stops: {},
};

_.assign(map, getSize());

map.projection = d3.geo.mercator().translate([0, 0]).scale(1);

map.path = d3.geo.path().projection(map.projection);

map.svg
    .append('path')
    .datum(topojson.feature(map.world, map.world.objects.countries))
    .attr('d', map.path)
    .attr('class', 'country');

map.svg
    .append('path')
    .datum(
        topojson.mesh(map.world, map.world.objects.countries, function (a, b) {
            return a !== b;
        })
    )
    .attr('d', map.path)
    .attr('class', 'border');

setRoute(mapData.route);

function setRoute(path) {
    const feature = topojson.feature(path, path.objects.route);

    map.bounds = map.path.bounds(feature);

    map.svg.append('path').datum(feature).attr('d', map.path).attr('class', 'route');

    refreshMap();
}

window.addEventListener('resize', _.debounce(resize, 500));

function setStop(el) {
    const id = el.getAttribute('data-for');
    if (map.stops[id]) {
        const pos = map.projection(map.stops[id]);
        el.style.top = pos[1] + 'px';
        el.style.left = pos[0] + 'px';
    }
}

function resize() {
    _.assign(map, getSize());

    refreshMap();
}

function getSize() {
    const rect = subMap.getBoundingClientRect();

    return {
        width: rect.width,
        height: rect.height,
    };
}

function refreshMap() {
    if (!map.bounds) {
        return;
    }

    const b = map.bounds,
        s = 0.9 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
        t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

    map.projection.scale(s).translate(t);

    map.svg.select('.country').attr('d', map.path);
    map.svg.select('.border').attr('d', map.path);
    map.svg.select('.route').attr('d', map.path);

    _.forEach(map.$stops, setStop);
}

_.forEach(articles, function (article) {
    const location = article.el.dataset.location.split(',').map(parseFloat);
    const id = article.el.id;
    map.stops[id] = location;
    _.forEach(document.querySelectorAll('[data-for="' + id + '"]'), setStop);
});
