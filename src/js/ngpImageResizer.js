(function() {
	'use strict';

	angular.module('ngWYSIWYG').service('ngpImageResizer', ['NGP_EVENTS', function(NGP_EVENTS) {
		var service = this;
		var iframeDoc, iframeWindow, iframeBody, resizerContainer, iframeScope;

		service.setup = function(scope, document) {
			iframeWindow = document.defaultView;
			iframeDoc = document;
			iframeBody = iframeDoc.querySelector('body');
			iframeScope = scope;

			// creating resizer element
			resizerContainer = iframeDoc.createElement('div');
			resizerContainer.className = 'ngp-image-resizer';
			resizerContainer.style.position = 'absolute';
			resizerContainer.style.border = '1px solid black';
			resizerContainer.style.display = 'none';

			// listening to events
			iframeScope.$on(NGP_EVENTS.ELEMENT_CLICKED, updateResizer);
			iframeScope.$on(NGP_EVENTS.CLICK_AWAY, removeResizer);
		};

		function updateResizer(event, element) {
			if (element.tagName !== 'IMG') {
				return removeResizer();
			}
			var elementStyle = iframeWindow.getComputedStyle(element);
			resizerContainer.style.height = elementStyle.getPropertyValue('height');
			resizerContainer.style.width = elementStyle.getPropertyValue('width');
			resizerContainer.style.top = elementStyle.getPropertyValue('top');
			resizerContainer.style.left = elementStyle.getPropertyValue('left');
			resizerContainer.style.display = 'block';
			element.parentNode.insertBefore(resizerContainer, element);
		}

		function removeResizer() {
			if (!resizerContainer.parentNode) {
				return;
			}
			resizerContainer.parentNode.removeChild(resizerContainer);
		}
	}]);
}());