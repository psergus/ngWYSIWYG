(function() {
	'use strict';
	angular.module('ngWYSIWYG').directive('ngpResizable', ['$document', function($document) {
		return function($scope, $element) {
			var doc = $document[0];
			var element = $element[0];

			var resizeDown = function($event) {
				// Function to manage resize down event
				var margin = 50;
				var uppest = element.offsetTop + margin;
				var height = margin;
				if ($event.pageY > uppest) {
					height = $event.pageY - (element.getBoundingClientRect().top + $event.view.pageYOffset);
				}

				var currentHeight = element.style.height.replace('px', '');
				if (currentHeight && currentHeight < height &&
					window.innerHeight - $event.clientY <= 45) {
					// scrolling to improve resize usability
					$event.view.scrollBy(0, height - currentHeight);
				}

				element.style.height = height + 'px';
			};

			var newElement = angular.element('<span class="resizer"></span>');
			$element.append(newElement);
			newElement[0].addEventListener('mousedown', function($event) {
				doc.addEventListener('mousemove', mousemove);
				doc.addEventListener('mouseup', mouseup);

				function mousemove($event) {
					$event.preventDefault();
					resizeDown($event);
				}

				function mouseup() {
					doc.removeEventListener('mousemove', mousemove);
					doc.removeEventListener('mouseup', mouseup);
				}
			});
		};
	}]);
}());