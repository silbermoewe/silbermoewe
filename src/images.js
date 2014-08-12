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

	var $pictures = $('article img'),
		$article = $('article h2').eq(0);

	function setPictSrc () {
		var width = $article.innerWidth();

		$pictures.each(function () {
			$(this).attr('src', getPictSource(width, this));
		});
	}

	$(window).on('resize', _.debounce(setPictSrc, 500));
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
			console.log('loaded');
			$container.css('background-image', 'url(' + getPictSource(width, $image) + ')');
		});
	});
};