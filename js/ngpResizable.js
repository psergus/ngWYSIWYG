(function() {
	'use strict';
	angular.module('ngWYSIWYG').directive('ngpResizable', ['$document', function($document) {
		return function($scope, $element) {
			var doc = $document[0];
			var element = $element[0];

			var resizeButton = doc.createElement('span');
			resizeButton.className = 'resizer';
			element.appendChild(resizeButton);

			resizeButton.addEventListener('mousedown', function() {
				doc.addEventListener('mousemove', resize);
				doc.addEventListener('mouseup', stopResizing);

				var iframes = doc.querySelectorAll('iframe');
				for (var i = 0; i < iframes.length; i++) {
					iframes[i].contentWindow.document.addEventListener('mouseup', stopResizing);
				}

				function resize(event) {
					event.preventDefault();

					// Function to manage resize down event
					var margin = 50;
					var uppest = element.offsetTop + margin;
					var height = margin;
					if (event.pageY > uppest) {
						height = event.pageY - (element.getBoundingClientRect().top + event.view.pageYOffset);
					}

					var currentHeight = element.style.height.replace('px', '');
					if (currentHeight && currentHeight < height &&
						window.innerHeight - event.clientY <= 45) {
						// scrolling to improve resize usability
						event.view.scrollBy(0, height - currentHeight);
					}

					element.style.height = height + 'px';
				}

				function stopResizing() {
					doc.removeEventListener('mousemove', resize);
					doc.removeEventListener('mouseup', stopResizing);

					var iframes = doc.querySelectorAll('iframe');
					for (var i = 0; i < iframes.length; i++) {
						iframes[i].contentWindow.document.removeEventListener('mouseup', stopResizing);
					}
				}
			});
		};
	}]);
}());