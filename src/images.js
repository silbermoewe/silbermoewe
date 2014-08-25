var $ = require('jquery'),
	_ = require('lodash');

module.exports = function () {

	function getPictSource(width, img) {
		var sizes = [400, 800, 1200, 1600, 2000];

		width = _.find(sizes, function (size) {
			return width < size;
		}) || _.last(sizes);

		return $(img).data('src') + '-' + width + '.jpg';
	}

	var $heading = $('article h2').eq(0),
		$articles = $('article'),
		articles = _.map($articles, function (val) { return val; }).reverse();

	function setPictSrc () {
		var width = $heading.innerWidth(),
			scrollPosition = $(window).scrollTop();

		var currentArticleIndex = _.findIndex(articles, function (val) {
			return $(val).offset().top <= scrollPosition;
		});

		var articlesToLoad = [articles[currentArticleIndex]];

		if (articles[currentArticleIndex - 1] !== undefined) {
			articlesToLoad.push(articles[currentArticleIndex - 1]);
		} 

		if (articles[currentArticleIndex + 1] !== undefined) {
			articlesToLoad.push(articles[currentArticleIndex + 1]);
		} 

		$(articlesToLoad).find('img').each(function () {
			$(this).attr('src', getPictSource(width, this));
		});
	}

	$(window).on('resize', _.debounce(setPictSrc, 500));
	$(window).on('scroll', _.debounce(setPictSrc, 500));
	setPictSrc();

	$('img').on('click', function () {
		var $image = $(this),
			$imagePreloader = $('<img>'),
			$images = $(this).parent().parent().find('img'),
			$container = $('<div class="image-view" />'),
			width = $(window).width();

		$('body').addClass('no-scroll').append($container);

		function setViewImage () {
			$container.css('background-image', 'url(/img/loading.gif)');
			$imagePreloader.attr('src', getPictSource(width, $image));
		}

		$imagePreloader.attr('src', getPictSource(width, $image));

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
			$container.css('background-image', 'url(' + getPictSource(width, $image) + ')');
		});
	});
};