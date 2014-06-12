'use strict';
angular.module('wysiwyg', []);

angular.module('wysiwyg').directive('wframe', ['$compile', '$http', '$timeout', 
    function($compile, $http, $timeout) {
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
		$body.html(ctrl.$viewValue || '');
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
		scope.getSelection();
		$document.execCommand(cmd.command, 0, cmd.arg);
		//scope.restoreSelection();
		$document.body.focus();
		scope.sync();
	    });
	    
	    //init
	    //var template  = $compile( '<p>test</p>' )(scope);
	    //$body.append(template);
	    //$head[0].innerHTML = '<script>function rightStuff() { document.oncontextmenu = null; document.onselectstart = null; document.onmousedown = null; };\nwindow.onload = rightStuff;</script><script src="/scripts/globals/wysiwyg-image.plugin.js"></script>';
	    //$compile('<script>function rightStuff() { alert(\'test\'); document.oncontextmenu = null; document.onselectstart = null; document.onmousedown = null; };\nwindow.onload = rightStuff;</script>')(scope)
	    /*
	    var rightStuff = '<script src="/scripts/globals/wysiwyg-image.plugin.js"></script>';
	    */
	    var fileref = document.createElement('script');
	    fileref.setAttribute("type","text/javascript");
	    fileref.setAttribute("src", '/scripts/globals/wysiwyg-image.plugin.js');
	    $element[0].contentDocument.head.appendChild( fileref );
	    console.log( $document );
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

angular.module('wysiwyg').directive('wysiwygEdit', ['$compile', '$timeout', 
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
	}
	return {
	    link: linker,
	    scope: {
		content: '='
	    },
	    restrict: 'AE',
	    replace: true,
	    templateUrl: '/globals/template/wysiwyg'
	}
    }
]);
