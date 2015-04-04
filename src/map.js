var d3 = require('d3'),
	topojson = require('topojson'),
	_ = require('lodash'),
	articles = require('./elements').articles;

var subMap = articles[0].fixed.getElementsByTagName('svg')[1];

var map = {
	world: require('./map.json'),
	svg: d3.select('#map'),
	$stops: document.getElementsByClassName('stop'),
	stops: {},
	width: subMap.offsetWidth,
	height: subMap.offsetHeight,
	factor: 2.8
};

_.assign(map, getSize());

map.projection = d3.geo.mercator()
					.center([19.54, 45.25]) // I used coordinates 9.21 23.64 29.87 64.36 for the bounding box
					.translate([map.width / 2, map.height / 2])
					.scale(map.width * map.factor); // no fucking idea how scaling works. trial & error.;

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

	map.svg.append('path')
		.datum(topojson.feature(path, path.objects.route))
		.attr('d', map.path)
		.attr('class', 'route');
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

	map.projection
		.translate([map.width / 2, map.height / 2])
		.scale(map.width * map.factor);

	map.svg.select('.country').attr('d', map.path);
	map.svg.select('.border').attr('d', map.path);
	map.svg.select('.route').attr('d', map.path);

	_.each(map.$stops, setStop);
}

function getSize() {
	var rect = subMap.getBoundingClientRect();

	return {
		width: rect.width,
		height: rect.height
	};
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