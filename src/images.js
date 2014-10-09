var $ = require('jquery'),
	_ = require('lodash');

var fixed = require('./fixed');

var lastIndex;

function articlesToLoad() {
	var scrollTop = window.pageYOffset,
		articles = [];

	var index = _.findIndex(fixed.elements, function (element) {
		return element.offset >= scrollTop;
	});

	if (index === lastIndex) {
		return [];
	}

	lastIndex = index;

	[index - 1, index, index + 1].forEach(function (i) {
		if (fixed.elements[i]) {
			articles.push(fixed.elements[i].article);
		}
	});

	return articles;
}

function getPicSrc(width, img) {
	var sizes = [400, 800, 1200, 1600, 2000];

	width = _.find(sizes, function (size) {
		return width < size;
	}) || _.last(sizes);

	return $(img).data('src') + '-' + width + '.jpg';
}

function setPicSrc() {
	var width = $(window).width() * 0.375;

	articlesToLoad().forEach(function ($article) {
		$article.find('img').each(function () {
			$(this).attr('src', getPicSrc(width, this));
		});
	});
}

$(window).on('resize', _.debounce(setPicSrc, 500));
$(window).on('scroll', _.debounce(setPicSrc, 500));
setPicSrc();

$('img').on('click', function () {
	var $image = $(this),
		$imagePreloader = $('<img>'),
		$images = $(this).parent().parent().find('img'),
		$container = $('<div class="image-view" />'),
		width = $(window).width();

	$('body').addClass('no-scroll').append($container);

	function setViewImage () {
		$container.css('background-image', 'url(/img/loading.gif)');
		$imagePreloader.attr('src', getPicSrc(width, $image));
	}

	$imagePreloader.attr('src', getPicSrc(width, $image));

	setViewImage();

	$(document).on('keydown.imageview', function (e) {
		var upcoming;
		if (e.keyCode === 27) {
			$container.trigger('click');
			return;
		} else if (e.keyCode === 37) {
			//back
			upcoming = $images[$images.index($image) - 1];
		} else if (e.keyCode === 39) {
			//forward
			upcoming = $images[$images.index($image) + 1];
		} else {
			return;
		}

		if (upcoming) {
			$image = $(upcoming);
			setViewImage();
		}
	});

	$container.on('click', function () {
		$(document).off('keydown.imageview');
		$(this).remove();
		$('body').removeClass('no-scroll');
	});

	$imagePreloader.load(function () {
		$container.css('background-image', 'url(' + getPicSrc(width, $image) + ')');
	});
});