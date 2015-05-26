var d3 = require('d3'),
	topojson = require('topojson'),
	_ = require('lodash'),
	articles = require('./elements').articles;

var subMap = articles[0].fixed.getElementsByTagName('svg')[1];

var map = {
	world: require('./map.json'),
	svg: d3.select('#map'),
	$stops: document.getElementsByClassName('stop'),
	stops: {}
};

_.assign(map, getSize());

map.projection = d3.geo.mercator()
					.translate([0, 0])
					.scale(1);

map.path = d3.geo.path().projection(map.projection);

map.svg.append('path')
		.datum(topojson.feature(map.world, map.world.objects.countries))
		.attr('d', map.path)
		.attr('class', 'country');

map.svg.append('path')
		.datum(topojson.mesh(map.world, map.world.objects.countries, function (a,b) { return a !== b; }))
		.attr('d', map.path)
		.attr('class', 'border');

d3.json('https://diesilbermoewe.de:61435/route', function (error, path) {
	if (error) { return; }

	var feature = topojson.feature(path, path.objects.route);

	map.bounds = map.path.bounds(feature);

	map.svg.append('path')
		.datum(feature)
		.attr('d', map.path)
		.attr('class', 'route');

	refreshMap();
});

window.addEventListener('resize', _.debounce(resize, 500));

function setStop(el) {
	var id = el.getAttribute('data-for');
	if (map.stops[id]) {
		var pos = map.projection(map.stops[id]);
		el.style.top = pos[1] + 'px';
		el.style.left = pos[0] + 'px';
	}
}

function resize() {
	_.assign(map, getSize());

	refreshMap();
}

function getSize() {
	var rect = subMap.getBoundingClientRect();

	return {
		width: rect.width,
		height: rect.height
	};
}

function refreshMap() {
	if (!map.bounds) { return; }

	var b = map.bounds,
		s = 0.9 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
		t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

	map.projection
    	.scale(s)
    	.translate(t);

	map.svg.select('.country').attr('d', map.path);
	map.svg.select('.border').attr('d', map.path);
	map.svg.select('.route').attr('d', map.path);

	_.each(map.$stops, setStop);
}

_.each(articles, function (article) {
	var time = article.el.getAttribute('data-time'),
		id = article.el.getAttribute('id');

	d3.json('https://diesilbermoewe.de:61435/location/' + time, function (error, location) {
		if (error) { return; }

		map.stops[id] = location;

		_.each(document.querySelectorAll('[data-for="' + id + '"]'), setStop);
	});
});