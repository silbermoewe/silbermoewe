var d3 = require('d3'),
	$ = require('jquery'),
	topojson = require('topojson');

module.exports = function () {
	var subMap = $('.map:first').find('svg');

	var map = {
		world: require('./map.json'),
		svg: d3.select('#map'),
		width: subMap.width(),
		height: subMap.height()
	};

	map.projection = d3.geo.mercator()
						.center([19.54,45.25]) // I used coordinates 9.21 23.64 29.87 64.36 for the bounding box
						.translate([map.width/2, map.height/2])
						.scale(map.width * 2.8); // no fucking idea how scaling works. trial & error.;

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

	$('article').each(function () {
		var time = $(this).data('time'),
			id = $(this).attr('id');

		d3.json('https://diesilbermoewe.de:61435/location/' + time, function (error, location) {
			if (error) { return; }

			var pos = map.projection(location);

			$('[data-for=' + id + ']').css({
				top: pos[1],
				left: pos[0]
			});
		});
	});
};