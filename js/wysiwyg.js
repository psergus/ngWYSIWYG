'use strict';
angular.module('ngWYSIWYG', []);

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
	    
	    //view --> model
	    $body.bind('blur keyup change paste', function() {
		scope.$apply(function blurkeyup() {
		    ctrl.$setViewValue($body.html());
		});
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
	
angular.module('ngWYSIWYG').directive('wysiwygEdit', ['$compile', '$timeout', 
    function($compile, $timeout) {
	var linker = function( scope, $element, attrs, ctrl ) {
	    scope.editMode = false;
	    scope.fonts = ['Verdana','Arial', 'Arial Black', 'Arial Narrow', 'Courier New', 'Century Gothic', 'Comic Sans MS', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Webdings','Trebuchet MS'];
	    scope.$watch('font', function(newValue) {
		if(newValue) {
		    scope.execCommand( 'fontname', newValue );
		    scope.font = '';
		}
	    });
	    scope.fontsizes = [1, 2, 3, 4, 5, 6, 7, 10, 15, 20, 25, 30, 40];
	    scope.$watch('fontsize', function(newValue) {
		if(newValue) {
		    scope.execCommand( 'fontsize', newValue );
		    scope.fontsize = '';
		}
	    });
	    scope.styles = [{name: 'Paragraph', key: '<p>'}, {name: 'Header 1', key: '<h1>'}, {name: 'Header 2', key: '<h2>'}, {name: 'Header 3', key: '<h3>'}, {name: 'Header 4', key: '<h4>'}, {name: 'Header 5', key: '<h5>'}, {name: 'Header 6', key: '<h6>'}];
	    scope.$watch('textstyle', function(newValue) {
		if(newValue) {
		    scope.execCommand( 'formatblock', newValue );
		    scope.fontsize = '';
		}
	    });
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
	    scope.insertLink = function() {
		var val = prompt('Please enter the URL', 'http://');
		scope.execCommand('createlink', val);
	    }
	    scope.insertImage = function() {
		var val = prompt('Please enter the picture URL', 'http://');
		scope.execCommand('insertimage', val);
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
	}
	return {
	    link: linker,
	    scope: {
		content: '='
	    },
	    restrict: 'AE',
	    replace: true,
	    templateUrl: 'tpl/wysiwyg.tpl'
	}
    }
]);
