'use strict';
(function(angular) {

angular.module('ngWYSIWYG', ['ngSanitize']);
var template = "<div class=\"tinyeditor\">" +
    "<div class=\"tinyeditor-header\" ng-hide=\"editMode\">" +
	"<div class=\"tinyeditor-buttons-group\">" +
	    "<div class=\"tinyeditor-control\" title=\"Bold\" style=\"background-position: 34px -120px;\" ng-class=\"{\'pressed\': cursorStyle.bold}\" ng-click=\"execCommand(\'bold\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Italic\" style=\"background-position: 34px -150px;\" ng-class=\"{\'pressed\': cursorStyle.italic}\" ng-click=\"execCommand(\'italic\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Underline\" style=\"background-position: 34px -180px;\" ng-class=\"{\'pressed\': cursorStyle.underline}\" ng-click=\"execCommand(\'underline\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Strikethrough\" style=\"background-position: 34px -210px;\" ng-class=\"{\'pressed\': cursorStyle.strikethrough}\" ng-click=\"execCommand(\'strikethrough\')\"></div>" +
	    "<div class=\"tinyeditor-divider\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Subscript\" style=\"background-position: 34px -240px;\" ng-class=\"{\'pressed\': cursorStyle.sub}\"ng-click=\"execCommand(\'subscript\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Superscript\" style=\"background-position: 34px -270px;\" ng-class=\"{\'pressed\': cursorStyle.super}\" ng-click=\"execCommand(\'superscript\')\"></div>" +
	    "<div class=\"tinyeditor-divider\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Left Align\" style=\"background-position: 34px -420px;\" ng-class=\"{\'pressed\': cursorStyle.alignment == 'left'}\" ng-click=\"execCommand(\'justifyleft\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Center Align\" style=\"background-position: 34px -450px;\" ng-class=\"{\'pressed\': cursorStyle.alignment == 'center'}\" ng-click=\"execCommand(\'justifycenter\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Right Align\" style=\"background-position: 34px -480px;\" ng-class=\"{\'pressed\': cursorStyle.alignment == 'right'}\" ng-click=\"execCommand(\'justifyright\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Block Justify\" style=\"background-position: 34px -510px;\" ng-class=\"{\'pressed\': cursorStyle.alignment == 'justify'}\" ng-click=\"execCommand(\'justifyfull\')\"></div>" +
	    "<div class=\"tinyeditor-divider\"></div>" +
	"</div>" +
	"<div class=\"tinyeditor-buttons-group\">" +
	    "<div class=\"tinyeditor-control\" title=\"Insert Ordered List\" style=\"background-position: 34px -300px;\" ng-click=\"execCommand(\'insertorderedlist\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Insert Unordered List\" style=\"background-position: 34px -330px;\" ng-click=\"execCommand(\'insertunorderedlist\')\"></div>" +
	    "<div class=\"tinyeditor-divider\"></div><div class=\"tinyeditor-control\" title=\"Outdent\" style=\"background-position: 34px -360px;\" ng-click=\"execCommand(\'outdent\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Indent\" style=\"background-position: 34px -390px;\" ng-click=\"execCommand(\'indent\')\"></div>" +
	    "<div class=\"tinyeditor-divider\"></div>" +
	"</div>" +
	"<div class=\"tinyeditor-buttons-group\">" +
	    "<div class=\"tinyeditor-control\" title=\"Remove Formatting\" style=\"background-position: 34px -720px;\" ng-click=\"execCommand(\'removeformat\')\"></div>" +
	    "<div class=\"tinyeditor-divider\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Undo\" style=\"background-position: 34px -540px;\" ng-click=\"execCommand(\'undo\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Redo\" style=\"background-position: 34px -570px;\" ng-click=\"execCommand(\'redo\')\"></div>" +
	    "<div class=\"tinyeditor-divider\"></div>" +
	"</div>" +
	"<div class=\"tinyeditor-buttons-group\">" +
	    "<div class=\"tinyeditor-control\" title=\"Font Color\" style=\"background-position: 34px -779px; position: relative;\" ng-click=\"showFontColors = !showFontColors\">            <colors-grid show=\"showFontColors\" on-pick=\"setFontColor(color)\"><colors-grid>        </div>" +
	    "<div class=\"tinyeditor-control\" title=\"Background Color\" style=\"background-position: 34px -808px; position: relative;\" ng-click=\"showBgColors = !showBgColors\">            <colors-grid show=\"showBgColors\" on-pick=\"setBgColor(color)\"><colors-grid>        </div>" +
	"</div>" +
	"<div class=\"tinyeditor-buttons-group\">" +
	    "<div class=\"tinyeditor-control\" title=\"Insert Image\" style=\"background-position: 34px -600px;\" ng-click=\"insertImage()\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Insert Horizontal Rule\" style=\"background-position: 34px -630px;\" ng-click=\"execCommand(\'inserthorizontalrule\')\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Insert Special Symbol\" style=\"background-position: 34px -838px; position: relative;\" ng-click=\"showSpecChars = !showSpecChars\">            <symbols-grid show=\"showSpecChars\" on-pick=\"insertSpecChar(symbol)\"><symbols-grid>        </div>" +
	    "<div class=\"tinyeditor-control\" title=\"Insert Hyperlink\" style=\"background-position: 34px -660px;\" ng-click=\"insertLink()\"></div>" +
	    "<div class=\"tinyeditor-control\" title=\"Remove Hyperlink\" style=\"background-position: 34px -690px;\" ng-click=\"execCommand(\'unlink\')\"></div>" +
	    "<div class=\"tinyeditor-divider\"></div>" +
	"</div>" +
	"<div class=\"tinyeditor-buttons-group\">" +
	    "<div class=\"tinyeditor-control\" title=\"Print\" style=\"background-position: 34px -750px;\" ng-click=\"execCommand(\'print\')\"></div>" +
	"</div>" +
	"<div class=\"tinyeditor-buttons-group\">" +
	    "<select class=\"tinyeditor-font\" ng-model=\"font\" ng-options=\"a as a for a in fonts\" ng-change=\"fontChange()\"><option value=\"\">Font</option></select>" +
	    "<select class=\"tinyeditor-size\" ng-model=\"fontsize\" ng-options=\"a.key as a.name for a in fontsizes\" ng-change=\"sizeChange()\"><option value=\"\">Size</option></select>" +
	    "<select class=\"tinyeditor-style\" ng-model=\"textstyle\" ng-options=\"s.key as s.name for s in styles\" ng-change=\"styleChange()\"><option value=\"\">Style</option></select>" +
	"</div>" +
	"<div style=\"clear: both;\"></div>" +
    "</div>" +
    "<div class=\"sizer\" ce-resize>" +
	"<textarea data-placeholder-attr=\"\" style=\"-webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; resize: none; width: 100%; height: 100%;\" ng-show=\"editMode\" ng-model=\"content\"></textarea>        <iframe style=\"-webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; width: 100%; height: 100%;\" ng-hide=\"editMode\" wframe=\"\" ng-model=\"content\"></iframe>    </div>" +
	"<div class=\"tinyeditor-footer\">" +
	"<div ng-switch=\"editMode\" ng-click=\"editMode = !editMode\" class=\"toggle\"><span ng-switch-when=\"true\">wysiwyg</span><span ng-switch-default>source</span></div>" + 
    "</div>" +
"</div>";

angular.module('ngWYSIWYG').directive('wframe', ['$compile', '$timeout', 
    function($compile, $timeout) {
	//kudos http://stackoverflow.com/questions/13881834/bind-angular-cross-iframes-possible
	var linker = function( scope, $element, attrs, ctrl ) {
	    var $document = $element[0].contentDocument;
	    $document.open(); //damn Firefox. kudos: http://stackoverflow.com/questions/15036514/why-can-i-not-set-innerhtml-of-an-iframe-body-in-firefox
	    $document.write('<!DOCTYPE html><html><head></head><body contenteditable="true"></body></html>');
	    $document.close();
	    $document.designMode = 'On';
	    var $body = angular.element($element[0].contentDocument.body);
	    var $head = angular.element($element[0].contentDocument.head);
	    $body.attr('contenteditable', 'true');
	    
	    /*
	    $element.bind('load', function (event) {
		console.log('iframe loaded');
		$document.designMode = 'On';
	    });
	    */
	    
	    //model --> view
	    ctrl.$render = function() {
		//$body.html(ctrl.$viewValue || ''); //not friendly with jQuery. snap you jQuery
		$body[0].innerHTML = ctrl.$viewValue || '';
	    }
	    
	    scope.sync = function() {
			scope.$evalAsync(function(scope) {
			    ctrl.$setViewValue($body.html());
			});
	    }
	    
	    
	    var getSelectionBoundaryElement = function(win, isStart) {
		var range, sel, container = null;
		var doc = win.document;
		if (doc.selection) {
		    // IE branch
		    range = doc.selection.createRange();
		    range.collapse(isStart);
		    return range.parentElement();
		}
		else if (doc.getSelection) {
		    //firefox
		    sel = doc.getSelection();
		    if (sel.rangeCount > 0) {
			range = sel.getRangeAt(0);
			//console.log(range);
			container = range[isStart ? "startContainer" : "endContainer"];
			if (container.nodeType === 3) {
			    container = container.parentNode;
			}
			//console.log(container);
		    }
		}
		else if (win.getSelection) {
		    // Other browsers
		    sel = win.getSelection();
		    if (sel.rangeCount > 0) {
			range = sel.getRangeAt(0);
			container = range[isStart ? "startContainer" : "endContainer"];
			
			// Check if the container is a text node and return its parent if so
			if (container.nodeType === 3) {
			    container = container.parentNode;
			}
		    }
		}
		return container;
	    }
	    
	    var debounce = null; //we will debounce the event in case of the rapid movement. Overall, we are intereseted in the last cursor/caret position
	    //view --> model
	    $body.bind('blur click keyup change paste', function() {
		//lets debounce it
		if(debounce) {
		    $timeout.cancel(debounce);
		}
		debounce = $timeout(function blurkeyup() {
			ctrl.$setViewValue($body.html());
			//check the caret position
			//http://stackoverflow.com/questions/14546568/get-parent-element-of-caret-in-iframe-design-mode
			var el = getSelectionBoundaryElement($element[0].contentWindow, true);
			if(el) {
			    var computedStyle = $element[0].contentWindow.getComputedStyle(el);
			    var elementStyle = {
				'bold': (computedStyle.getPropertyValue("font-weight") == 'bold' || parseInt(computedStyle.getPropertyValue("font-weight")) >= 700),
				'italic': (computedStyle.getPropertyValue("font-style") == 'italic'),
				'underline': (computedStyle.getPropertyValue("text-decoration") == 'underline'),
				'strikethrough': (computedStyle.getPropertyValue("text-decoration") == 'line-through'),
				'font': computedStyle.getPropertyValue("font-family"),
				'size': parseInt(computedStyle.getPropertyValue("font-size")),
				'color': computedStyle.getPropertyValue("color"),
				'sub': (computedStyle.getPropertyValue("vertical-align") == 'sub'),
				'super': (computedStyle.getPropertyValue("vertical-align") == 'super'),
				'background': computedStyle.getPropertyValue("background-color"),
				'alignment': computedStyle.getPropertyValue("text-align")
			    };
			    //dispatch upward the through the scope chain
			    scope.$emit('cursor-position', elementStyle);
			    //console.log( JSON.stringify(elementStyle) );
			}
		    },
		100/*ms*/, true /*invoke apply*/);
	    });
	    

	    scope.range = null;
	    scope.getSelection = function() {
			if($document.getSelection) {
			    var sel = $document.getSelection();
			    if(sel.getRangeAt && sel.rangeCount) {
				scope.range = sel.getRangeAt(0);
			    }
			}
	    }
	    scope.restoreSelection = function() {
			if(scope.range && $document.getSelection) {
			    var sel = $document.getSelection();
			    sel.removeAllRanges();
			    sel.addRange(scope.range);
			}
	    }
	    
	    scope.$on('execCommand', function(e, cmd) {
			console.log('execCommand: ');
			console.log(cmd);
			$element[0].contentDocument.body.focus();
			//scope.getSelection();
			var sel = $document.selection; //http://stackoverflow.com/questions/11329982/how-refocus-when-insert-image-in-contenteditable-divs-in-ie
			if (sel) {
			    var textRange = sel.createRange();
			    $document.execCommand(cmd.command, 0, cmd.arg);
			    textRange.collapse(false);
			    textRange.select();
			}
			else {
			    $document.execCommand(cmd.command, 0, cmd.arg);
			}
			//scope.restoreSelection();
			$document.body.focus();
			scope.sync();
	    });
	    
	    //init
	    try {
		$document.execCommand("styleWithCSS", 0, 0);
		$document.execCommand('contentReadOnly', 0, 'false');
	    }
	    catch(e) { 
		try { 
		    $document.execCommand("useCSS", 0, 1);
		} 
		catch(e) {
		}
	    }
	}
	return {
	    link: linker,
	    require: 'ngModel',
	    replace: true,
	    restrict: 'AE'
	}
    }
]);
// kudos to http://codereview.stackexchange.com/questions/61847/draggable-resizeable-box
angular.module("ngWYSIWYG").directive("ceResize", ['$document', function($document) {
	return function($scope, $element, $attr) {
		//Reference to the original
		var $mouseDown;

		// Function to manage resize up event
		var resizeUp = function($event) {
			var margin = 50,
			lowest = $mouseDown.top + $mouseDown.height - margin,
			top = $event.pageY > lowest ? lowest : $event.pageY,
			height = $mouseDown.top - top + $mouseDown.height;

			$element.css({
				top: top + "px",
				height: height + "px"
			});
		};
		// Function to manage resize down event
		var resizeDown = function($event) {
			var margin = 50,
			uppest = $element[0].offsetTop + margin,
			height = $event.pageY > uppest ? $event.pageY - $element[0].offsetTop : margin;

			$element.css({
				height: height + "px"
			});
		};


		var createResizer = function createResizer( className , handlers ) {
			var newElement = angular.element( '<span class="' + className + '"></span>' );
			$element.append(newElement);
			newElement.on("mousedown", function($event) {

				$document.on("mousemove", mousemove);
				$document.on("mouseup", mouseup);

				//Keep the original event around for up / left resizing
				$mouseDown = $event;
				$mouseDown.top = $element[0].offsetTop;
				$mouseDown.left = $element[0].offsetLeft
				$mouseDown.width = $element[0].offsetWidth;
				$mouseDown.height = $element[0].offsetHeight;

				function mousemove($event) {
				$event.preventDefault();
				for( var i = 0 ; i < handlers.length ; i++){
				handlers[i]( $event );
				}
				}

				function mouseup() {
					$document.off("mousemove", mousemove);
					$document.off("mouseup", mouseup);
				}
			});
		}

		createResizer( 'resizer' , [ resizeDown ,  resizeDown ] );
	};
}]);
angular.module('ngWYSIWYG').directive('colorsGrid', ['$compile', '$document',
    function($compile, $document) {
	var linker = function( scope, element, attrs, ctrl ) {
	    //click away
	    $document.on("click", function() {
		scope.$apply(function() {
		    scope.show = false;
		});
	    });
	    element.parent().bind('click', function(e) {
		e.stopPropagation();
	    });
	    scope.colors = ['#000000', '#993300', '#333300', '#003300', '#003366', '#000080', '#333399', '#333333', '#800000', '#FF6600', '#808000', '#008000', '#008080', '#0000FF', '#666699', '#808080', '#FF0000', '#FF9900', '#99CC00', '#339966', '#33CCCC', '#3366FF', '#800080', '#999999', '#FF00FF', '#FFCC00', '#FFFF00', '#00FF00', '#00FFFF', '#00CCFF', '#993366', '#C0C0C0', '#FF99CC', '#FFCC99', '#FFFF99', '#CCFFCC', '#CCFFFF', '#99CCFF', '#CC99FF', '#FFFFFF' ];
	    scope.pick = function( color ) {
		scope.onPick({color: color});
	    }
	    element.ready(function() {
		//real deal for IE
		function makeUnselectable(node) {
		    if (node.nodeType == 1) {
			node.setAttribute("unselectable", "on");
			node.unselectable = 'on';
		    }
		    var child = node.firstChild;
		    while (child) {
			makeUnselectable(child);
			child = child.nextSibling;
		    }
		}
		//IE fix
		for(var i = 0; i < document.getElementsByClassName('colors-grid').length; i += 1) {
		    makeUnselectable(document.getElementsByClassName("colors-grid")[i]);
		}
	    });
	}
	return {
	    link: linker,
	    scope: {
		show: '=',
		onPick: '&'
	    },
	    restrict: 'AE',
	    template: '<ul ng-show="show" class="colors-grid"><li ng-style="{\'background-color\': color}" title: "{{color}}" ng-repeat="color in colors" unselectable="on" ng-click="pick(color)"></li></ul>'
	}
    }
]);
angular.module('ngWYSIWYG').directive('symbolsGrid', ['$compile', '$document', '$sce',
    function($compile, $document, $sce) {
        var linker = function( scope, element, attrs, ctrl ) {
            //click away
            $document.on("click", function() {
                scope.$apply(function() {
                    scope.show = false;
                });
            });
            element.parent().bind('click', function(e) {
                e.stopPropagation();
            });
            scope.symbols = ['&iexcl;', '&iquest;', '&ndash;', '&mdash;', '&raquo;', '&laquo;', '&copy;', '&divide;', '&micro;', '&para;', '&plusmn;', '&cent;', '&euro;', '&pound;', '&reg;', '&sect;', '&trade;', '&yen;', '&deg;', '&forall;', '&part;', '&exist;', '&empty;', '&nabla;', '&isin;', '&notin;', '&ni;', '&prod;', '&sum;', '&uarr;', '&rarr;', '&darr;', '&spades;', '&clubs;', '&hearts;', '&diams;', '&aacute;', '&agrave;', '&acirc;', '&aring;', '&atilde;', '&auml;', '&aelig;', '&ccedil;', '&eacute;', '&egrave;', '&ecirc;', '&euml;', '&iacute;', '&igrave;', '&icirc;', '&iuml;', '&ntilde;', '&oacute;', '&ograve;', '&ocirc;', '&oslash;', '&otilde;', '&ouml;', '&szlig;', '&uacute;', '&ugrave;', '&ucirc;', '&uuml;', '&yuml;'];
            scope.pick = function( symbol ) {
                scope.onPick({symbol: symbol});
            }
            element.ready(function() {
                //real deal for IE
                function makeUnselectable(node) {
                    if (node.nodeType == 1) {
                        node.setAttribute("unselectable", "on");
                        node.unselectable = 'on';
                    }
                    var child = node.firstChild;
                    while (child) {
                        makeUnselectable(child);
                        child = child.nextSibling;
                    }
                }
                //IE fix
                for(var i = 0; i < document.getElementsByClassName('symbols-grid').length; i += 1) {
                    makeUnselectable(document.getElementsByClassName("symbols-grid")[i]);
                }
            });
        }
        return {
            link: linker,
            scope: {
                show: '=',
                onPick: '&'
            },
            restrict: 'AE',
            template: '<ul ng-show="show" class="symbols-grid"><li ng-repeat="symbol in symbols" unselectable="on" ng-click="pick(symbol)" ng-bind-html="symbol"></li></ul>'
        }
    }
]);
	
angular.module('ngWYSIWYG').directive('wysiwygEdit', ['$compile', '$timeout', '$q',
    function($compile, $timeout, $q) {
	var linker = function( scope, $element, attrs, ctrl ) {
	    scope.editMode = false;
	    scope.cursorStyle = {}; //current cursor/caret position style
	    scope.fonts = ['Verdana','Arial', 'Arial Black', 'Arial Narrow', 'Courier New', 'Century Gothic', 'Comic Sans MS', 'Georgia', 'Impact', 'Tahoma', 'Times', 'Times New Roman', 'Webdings','Trebuchet MS'];
	    /*
	    scope.$watch('font', function(newValue) {
		if(newValue) {
		    scope.execCommand( 'fontname', newValue );
		    scope.font = '';
		}
	    });
	    */
	    scope.fontChange = function() {
		scope.execCommand( 'fontname', scope.font );
		//scope.font = '';
	    }
	    scope.fontsizes = [{key: 1, name: 'x-small'}, {key: 2, name: 'small'}, {key: 3, name: 'normal'}, {key: 4, name: 'large'}, {key: 5, name: 'x-large'}, {key: 6, name: 'xx-large'}, {key: 7, name: 'xxx-large'}];
	    scope.mapFontSize = { 10: 1, 13: 2, 16: 3, 18: 4, 24: 5, 32: 6, 48: 7};
	    scope.sizeChange = function() {
		scope.execCommand( 'fontsize', scope.fontsize );
	    }
	    /*
	    scope.$watch('fontsize', function(newValue) {
		if(newValue) {
		    scope.execCommand( 'fontsize', newValue );
		    scope.fontsize = '';
		}
	    });
	    */
	    scope.styles = [{name: 'Paragraph', key: '<p>'}, {name: 'Header 1', key: '<h1>'}, {name: 'Header 2', key: '<h2>'}, {name: 'Header 3', key: '<h3>'}, {name: 'Header 4', key: '<h4>'}, {name: 'Header 5', key: '<h5>'}, {name: 'Header 6', key: '<h6>'}];
	    scope.styleChange = function() {
		scope.execCommand( 'formatblock', scope.fontsize );
	    }
	    /*
	    scope.$watch('textstyle', function(newValue) {
		if(newValue) {
		    scope.execCommand( 'formatblock', newValue );
		    scope.fontsize = '';
		}
	    });
	    */
	    scope.showFontColors = false;
		    scope.setFontColor = function( color ) {
			scope.execCommand('foreColor', color);
	    }
	    scope.showBgColors = false;
		    scope.setBgColor = function( color ) {
			scope.execCommand('hiliteColor', color);
	    }
	    
	    scope.execCommand = function(cmd, arg) {
			scope.$emit('execCommand', {command: cmd, arg: arg});
	    }
	    scope.showSpecChars = false;
	    scope.insertSpecChar = function(symbol) {
            scope.execCommand('insertHTML', symbol);
	    }
	    scope.insertLink = function() {
		var val = prompt('Please enter the URL', 'http://');
		if(val) scope.execCommand('createlink', val);
	    }
	    /*
	    * insert image button
	    */
	    scope.insertImage = function() {
		var val;
		if(scope.api && scope.api.insertImage && angular.isFunction(scope.api.insertImage)) {
		    val = scope.api.insertImage.apply( scope.api.scope || null );
		}
		else {
		    val = prompt('Please enter the picture URL', 'http://');
		    val = '<img src="' + val + '">'; //we convert into HTML element.
		}
		//resolve the promise if any
		$q.when(val).then( function(data) {
		    //scope.execCommand('insertimage', val);
		    scope.execCommand('insertHTML', data); //we insert image as an HTML element instead of giving the editor a direct command to insert an image with url
		});
	    }
	    $element.ready(function() {
			function makeUnselectable(node) {
			    if (node.nodeType == 1) {
					node.setAttribute("unselectable", "on");
					node.unselectable = 'on';
			    }
			    var child = node.firstChild;
			    while (child) {
					makeUnselectable(child);
					child = child.nextSibling;
			    }
			}
			//IE fix
			for(var i = 0; i < document.getElementsByClassName('tinyeditor-header').length; i += 1) {
			    makeUnselectable(document.getElementsByClassName("tinyeditor-header")[i]);
			}
	    });
	    //catch the cursort position style
	    scope.$on('cursor-position', function(event, data) {
		//console.log('cursor-position', data);
		scope.cursorStyle = data;
		scope.font = data.font.replace(/(')/g, ''); //''' replace single quotes
		scope.fontsize = scope.mapFontSize[data.size]? scope.mapFontSize[data.size] : 0;
	    });
	}
	return {
	    link: linker,
	    scope: {
		content: '=', //this is our content which we want to edit
		api: '=' //this is our api object
	    },
	    restrict: 'AE',
	    replace: true,
	    template: template
	}
    }
]);

})(angular);