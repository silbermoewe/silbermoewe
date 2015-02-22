var _ = require('lodash');

var images = require('./elements').images;
var win = require('./window-dimensions');
var inViewport = require('./in-viewport');
var loadImage = require('./load-image');

win.onResize(setPicSrc);
window.addEventListener('scroll', setPicSrc);
setPicSrc();

function setPicSrc() {
	_.each(inViewport(images, window.pageYOffset, win.height * 2), loadImage);
}

// $('img').on('click', function () {
// 	var $image = $(this),
// 		$imagePreloader = $('<img>'),
// 		$images = $(this).parent().parent().find('img'),
// 		$container = $('<div class="image-view" />'),
// 		width = $(window).width();
//
// 	$('body').addClass('no-scroll').append($container);
//
// 	function setViewImage () {
// 		$container.css('background-image', 'url(/img/loading.gif)');
// 		$imagePreloader.attr('src', getPicSrc(width, $image));
// 	}
//
// 	$imagePreloader.attr('src', getPicSrc(width, $image));
//
// 	setViewImage();
//
// 	$(document).on('keydown.imageview', function (e) {
// 		var upcoming;
// 		if (e.keyCode === 27) {
// 			$container.trigger('click');
// 			return;
// 		} else if (e.keyCode === 37) {
// 			//back
// 			upcoming = $images[$images.index($image) - 1];
// 		} else if (e.keyCode === 39) {
// 			//forward
// 			upcoming = $images[$images.index($image) + 1];
// 		} else {
// 			return;
// 		}
//
// 		if (upcoming) {
// 			$image = $(upcoming);
// 			setViewImage();
// 		}
// 	});
//
// 	$container.on('click', function () {
// 		$(document).off('keydown.imageview');
// 		$(this).remove();
// 		$('body').removeClass('no-scroll');
// 	});
//
// 	$imagePreloader.load(function () {
// 		$container.css('background-image', 'url(' + getPicSrc(width, $image) + ')');
// 	});
// });
