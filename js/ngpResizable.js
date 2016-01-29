(function() {
	angular.module('ngWYSIWYG').directive('ngpResizable', ['$document', function($document) {
		return function($scope, $element) {
			//Reference to the original
			var $mouseDown;

			// Function to manage resize up event
			var resizeUp = function($event) {
				var margin = 50,
					lowest = $mouseDown.top + $mouseDown.height - margin,
					top = $event.pageY > lowest ? lowest : $event.pageY,
					height = $mouseDown.top - top + $mouseDown.height;

				$element.css({
					top: top + 'px',
					height: height + 'px'
				});
			};

			// Function to manage resize down event
			var resizeDown = function($event) {
				var margin = 50,
					uppest = $element[0].offsetTop + margin,
					height = $event.pageY > uppest ? $event.pageY - $element[0].offsetTop : margin;

				$element.css({
					height: height + 'px'
				});
			};

			var newElement = angular.element('<span class="resizer"></span>');
			$element.append(newElement);
			newElement.on('mousedown', function($event) {

				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);

				//Keep the original event around for up / left resizing
				$mouseDown = $event;
				$mouseDown.top = $element[0].offsetTop;
				$mouseDown.left = $element[0].offsetLeft;
				$mouseDown.width = $element[0].offsetWidth;
				$mouseDown.height = $element[0].offsetHeight;

				function mousemove($event) {
					$event.preventDefault();
					resizeDown($event);
					resizeUp($event);
				}

				function mouseup() {
					$document.off('mousemove', mousemove);
					$document.off('mouseup', mouseup);
				}
			});
		};
	}]);
}());