var d3 = require('d3'),
	$ = require('jquery'),
	topojson = require('topojson');

module.exports = function () {
	var subMap = $('.map:first').find('svg');

	var map = {
		world: require('./map.json'),
		svg: d3.select('#map'),
		$stops: $('.stop'),
		stops: {},
		width: subMap.width(),
		height: subMap.height(),
		factor: 2.8
	};

	map.projection = d3.geo.mercator()
						.center([19.54,45.25]) // I used coordinates 9.21 23.64 29.87 64.36 for the bounding box
						.translate([map.width/2, map.height/2])
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

	function setStop() {
		var id = $(this).data('for');
		if (map.stops[id]) {
			var pos = map.projection(map.stops[id]);
			$(this).css({
				top: pos[1],
				left: pos[0]
			});
		}
	}

	$('article').each(function () {
		var time = $(this).data('time'),
			id = $(this).attr('id');

		d3.json('https://diesilbermoewe.de:61435/location/' + time, function (error, location) {
			if (error) { return; }

			map.stops[id] = location;

			$('[data-for="' + id + '"]').each(setStop);
		});
	});

	function resize() {
		map.width = subMap.width();
		map.height = subMap.height();

		map.projection
			.translate([map.width/2, map.height/2])
			.scale(map.width * map.factor);

		map.svg.select('.country').attr('d', map.path);
		map.svg.select('.border').attr('d', map.path);
		map.svg.select('.route').attr('d', map.path);

		map.$stops.each(setStop);
	}

	function mobileResize() {
		$('.map').css('height', $(window).height());
		resize();
	}

	var isMobile = window.navigator.userAgent.toLowerCase().indexOf('mobile') !== -1;

	$(window).on('resize', (isMobile) ? mobileResize : resize);

	if (isMobile) { mobileResize(); }
};