'use strict';

// anchengjian.com
// 2015-09-13

(function(angular) {
  
  angular.module('ngTinyEditor', []);
  var template = "<div class=\"tinyeditor\">" + 
  "<div class=\"tinyeditor-header clearfix\" >" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"加粗\" ng-class=\"{\'pressed\': cursorStyle.bold}\" ng-click=\"execCommand(\'bold\')\"><i class=\"fa fa-bold\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"斜体\" ng-class=\"{\'pressed\': cursorStyle.italic}\" ng-click=\"execCommand(\'italic\')\"><i class=\"fa fa-italic\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"下划线\" ng-class=\"{\'pressed\': cursorStyle.underline}\" ng-click=\"execCommand(\'underline\')\"><i class=\"fa fa-underline\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"删除线\" ng-class=\"{\'pressed\': cursorStyle.strikethrough}\" ng-click=\"execCommand(\'strikethrough\')\"><i class=\"fa fa-strikethrough\"></i></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"下标\" ng-class=\"{\'pressed\': cursorStyle.sub}\"ng-click=\"execCommand(\'subscript\')\"><i class=\"fa fa-subscript\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"上标\" ng-class=\"{\'pressed\': cursorStyle.super}\" ng-click=\"execCommand(\'superscript\')\"><i class=\"fa fa-superscript\"></i></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"左对齐\" ng-class=\"{\'pressed\': cursorStyle.alignment == 'left'}\" ng-click=\"execCommand(\'justifyleft\')\"><i class=\"fa fa-align-left\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"居中\" ng-class=\"{\'pressed\': cursorStyle.alignment == 'center'}\" ng-click=\"execCommand(\'justifycenter\')\"><i class=\"fa fa-align-center\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"右对齐\" ng-class=\"{\'pressed\': cursorStyle.alignment == 'right'}\" ng-click=\"execCommand(\'justifyright\')\"><i class=\"fa fa-align-right\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"两端对齐\" ng-class=\"{\'pressed\': cursorStyle.alignment == 'justify'}\" ng-click=\"execCommand(\'justifyfull\')\"><i class=\"fa fa-align-justify\"></i></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"有序列表\" ng-click=\"execCommand(\'insertorderedlist\')\"><i class=\"fa fa-list-ol\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"无序列表\" ng-click=\"execCommand(\'insertunorderedlist\')\"><i class=\"fa fa-list-ul\"></i></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"外缩进\" ng-click=\"execCommand(\'outdent\')\"><i class=\"fa fa-outdent\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"内缩进\" ng-click=\"execCommand(\'indent\')\"><i class=\"fa fa-indent\"></i></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"清空格式\" ng-click=\"execCommand(\'removeformat\')\"><i class=\"fa fa-eraser\"></i></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"撤销\" ng-click=\"execCommand(\'undo\')\"><i class=\"fa fa-undo\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"重做\" ng-click=\"execCommand(\'redo\')\"><i class=\"fa fa-repeat\"></i></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"字体颜色\" ng-click=\"showFontColors = !showFontColors;showBgColors=false;showSpecChars=false;\"><i class=\"fa fa-font\"></i><colors-grid show=\"showFontColors\" on-pick=\"setFontColor(color)\"><colors-grid></div>" + 
      "<div class=\"tinyeditor-control\" title=\"背景颜色\" ng-click=\"showBgColors = !showBgColors;showFontColors=false;showSpecChars=false;\"><i class=\"fa fa-paint-brush\"></i><colors-grid show=\"showBgColors\" on-pick=\"setBgColor(color)\"><colors-grid></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"图片\" ng-click=\"insertImage()\"><i class=\"fa fa-image\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"水平线\" ng-click=\"execCommand(\'inserthorizontalrule\')\"><i class=\"fa fa-bars\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"特殊字符\" ng-click=\"showSpecChars = !showSpecChars;showFontColors=false;showBgColors=false;\"><i class=\"fa fa-cubes\"></i><symbols-grid show=\"showSpecChars\" on-pick=\"insertSpecChar(symbol)\"><symbols-grid></div>" + 
      "<div class=\"tinyeditor-control\" title=\"插入链接\" ng-click=\"insertLink()\"><i class=\"fa fa-link\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"清除链接\" ng-click=\"execCommand(\'unlink\')\"><i class=\"fa fa-chain-broken\"></i></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<div class=\"tinyeditor-control\" title=\"打印\" ng-click=\"execCommand(\'print\')\"><i class=\"fa fa-print\"></i></div>" + 
      "<div class=\"tinyeditor-control\" title=\"全屏\" ng-click=\"fullScreen()\"><i class=\"fa fa-arrows-alt\"></i></div>" + 
    "</div>" + 
    "<div class=\"tinyeditor-buttons-group\">" + 
      "<select class=\"form-control tinyeditor-font\" ng-model=\"font\" ng-options=\"a as a for a in fonts\" ng-change=\"fontChange()\"><option value=\"\">Font</option></select>" + 
      "<select class=\"form-control tinyeditor-size\" ng-model=\"fontsize\" ng-options=\"a.key as a.name for a in fontsizes\" ng-change=\"sizeChange()\"><option value=\"\">Size</option></select>" + 
      "<select class=\"form-control tinyeditor-style\" ng-model=\"textstyle\" ng-options=\"a.key as a.name for a in styles\" ng-change=\"styleChange()\"><option value=\"\">Style</option></select>" + 
    "</div>" + 
  "</div>" + 
  "<div class=\"sizer\" ce-resize>" + 
    "<textarea data-placeholder-attr=\"\" ng-show=\"editMode\" ng-model=\"content\" class=\"tinyeditor-source\"></textarea>" + 
    "<iframe  ng-hide=\"editMode\" wframe=\"\" ng-model=\"content\" class=\"tinyeditor-preview\"></iframe>" + 
  "</div>" + 
  "<div class=\"tinyeditor-footer\">" + 
    "<div ng-switch=\"editMode\" ng-click=\"editMode = !editMode\" class=\"toggle\">" + 
      "<i class=\"fa fa-code\"></i><span ng-switch-when=\"true\"> preview</span><span ng-switch-default> source</span>" + 
    "</div>" + 
  "</div>";
  
  angular.module('ngTinyEditor').directive('wframe', ['$compile', '$timeout', function($compile, $timeout) {
    //kudos http://stackoverflow.com/questions/13881834/bind-angular-cross-iframes-possible
    var linker = function(scope, $element, attrs, ctrl) {
      var $document = $element[0].contentDocument;
      $document.open();
      //damn Firefox. kudos: http://stackoverflow.com/questions/15036514/why-can-i-not-set-innerhtml-of-an-iframe-body-in-firefox
      $document.write('<!DOCTYPE html><html><head></head><body contenteditable="true"></body></html>');
      $document.close();
      $document.designMode = 'On';
      var $body = angular.element($element[0].contentDocument.body),
          $head = angular.element($element[0].contentDocument.head);
      $body.attr('contenteditable', 'true');
      
      /*
	    $element.bind('load', function (event) {
				console.log('iframe loaded');
				$document.designMode = 'On';
	    });
	    */
      
      //model --> view
      ctrl.$render = function() {
        //$body.html(ctrl.$viewValue || '');
        //not friendly with jQuery. snap you jQuery

        // xss filter 
        // anchengjian
        // 20150-09-23
        var allows, nodes, childNode;
        allows = {
          "a" : [ "title", "ping", "href", "class", "target", "style" ],
          "b" : [ "class", "style" ],
          "img" : [ "src", "class", "style" ],
          "div" : [ "class", "style" ],
          "p" : [ "class", "style" ],
          "h1" : [ "class", "style" ],
          "h2" : [ "class", "style" ],
          "h3" : [ "class", "style" ],
          "h4" : [ "class", "style" ],
          "h5" : [ "class", "style" ],
          "h6" : [ "class", "style" ],
          "span" : [ "class", "style" ],
          "ol" : [ "class", "style" ],
          "ul" : [ "class", "style" ],
          "blockquote" : [ "class", "style" ],
          "hr" : [ "class", "style" ]
        }
        nodes = ctrl.$viewValue || '';
        try{
          var parser = new DOMParser();
          nodes = parser.parseFromString( nodes, "text/html" ).body;
        }catch(e){
          var doc = new ActiveXObject ("MSXML2.DOMDocument");
          nodes = doc.loadXML(nodes).body;
        }

        function filterNodes(node){
          var i, newNode, attributes, child;

          switch( node.nodeType ){
          case 1: // ELEMENT_NODE
            attributes = allows[ node.tagName.toLowerCase() ];
            if( attributes === undefined ) return undefined;

            newNode = document.createElement( node.tagName );
            for( i = 0; i < node.attributes.length; i++ ){
              if( attributes.indexOf( node.attributes[ i ].name ) != -1 ){
                switch(node.attributes[ i ].name){
                  case "href": node.attributes[ i ] = _deal_href(node.attributes[ i ]);break;
                  case "style": node.attributes[ i ] = _deal_style(node.attributes[ i ]);break;
                }
                newNode.setAttribute( node.attributes[ i ].name, node.attributes[ i ].value );
              }
            }
            for( i = 0; i < node.childNodes.length; i++ ){
              child = filterNodes( node.childNodes[ i ] );
              if( child !== undefined ){
                newNode.appendChild( child );
              }
            }
            return newNode;
          case 3: // TEXT_NODE
            return document.createTextNode( node.textContent );
          default:
            return undefined;
          }
        }
        var _deal_href = function(attr){
          var href = attr.value;
          if (href.indexOf("http://") === 0 || href.indexOf("http://") === 0) {
            attr.value = href;
          }else{
            attr.value = "http://" + href;
          }
          return attr;
        }
        var _deal_style = function(attr){
          var style = attr.value;
          var re = /expression/gim
          style = style.replace(/\\/g, ' ').replace(/&#/g, ' ').replace(/\/\*/g, ' ').replace(/\*\//g, ' ');
          attr.value = style.replace(re, ' ');
          return attr;
        }

        try{
          var parser = new DOMParser();
          var target = parser.parseFromString( "", "text/html" ).body;
        }catch(e){
          var doc = new ActiveXObject ("MSXML2.DOMDocument");
          var target = doc.loadXML("").body;
        }

        for( var i = 0; i < nodes.childNodes.length; i++ ){
          childNode = filterNodes( nodes.childNodes[ i ] );
          if( childNode !== undefined ){
            target.appendChild( childNode );
          }
        }

        $body[0].innerHTML=target.innerHTML;

        // $body[0].innerHTML = ctrl.$viewValue || '';

      }
      
      scope.sync = function() {
        scope.$evalAsync(function(scope) {
          ctrl.$setViewValue($body.html());
        }
        );
      }
      
      
      var getSelectionBoundaryElement = function(win, isStart) {
        var range, sel, container = null ;
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
      
      var debounce = null ;
      //we will debounce the event in case of the rapid movement. Overall, we are intereseted in the last cursor/caret position
      //view --> model
      $body.bind('blur click keyup change paste', function() {
        //lets debounce it
        if (debounce) {
          $timeout.cancel(debounce);
        }
        debounce = $timeout(function blurkeyup() {
          ctrl.$setViewValue($body.html());
          //check the caret position
          //http://stackoverflow.com/questions/14546568/get-parent-element-of-caret-in-iframe-design-mode
          var el = getSelectionBoundaryElement($element[0].contentWindow, true);
          if (el) {
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
        }, 100 /*ms*/, true /*invoke apply*/);
      });
      
      
      scope.range = null ;
      scope.getSelection = function() {
        if ($document.getSelection) {
          var sel = $document.getSelection();
          if (sel.getRangeAt && sel.rangeCount) {
            scope.range = sel.getRangeAt(0);
          }
        }
      }
      scope.restoreSelection = function() {
        if (scope.range && $document.getSelection) {
          var sel = $document.getSelection();
          sel.removeAllRanges();
          sel.addRange(scope.range);
        }
      }
      
      scope.$on('execCommand', function(e, cmd) {
        $element[0].contentDocument.body.focus();
        //scope.getSelection();
        var sel = $document.selection;
        //http://stackoverflow.com/questions/11329982/how-refocus-when-insert-image-in-contenteditable-divs-in-ie
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
      catch (e) {
        try {
          $document.execCommand("useCSS", 0, 1);
        } 
        catch (e) {
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
  angular.module("ngTinyEditor").directive("ceResize", ['$document', function($document) {
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
      
      
      var createResizer = function createResizer(className, handlers) {
        var newElement = angular.element('<span class="' + className + '"><i class="fa fa-arrows-v"></i></span>');
        $element.next().append(newElement);
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
            for (var i = 0; i < handlers.length; i++) {
              handlers[i]($event);
            }
          }
          
          function mouseup() {
            $document.off("mousemove", mousemove);
            $document.off("mouseup", mouseup);
          }
        }
        );
      }
      
      createResizer('resizer', [resizeDown, resizeDown]);
    };
  }]);

  angular.module('ngTinyEditor').directive('colorsGrid', ['$compile', '$document', function($compile, $document) {
    var linker = function(scope, element, attrs, ctrl) {
      //click away
      $document.on("click", function() {
        scope.$apply(function() {
          scope.show = false;
        });
      });
      element.parent().bind('click', function(e) {
        e.stopPropagation();
      });
      scope.colors = ['#000000', '#993300', '#333300', '#003300', '#003366', '#000080', '#333399', '#333333', '#800000', '#FF6600', '#808000', '#008000', '#008080', '#0000FF', '#666699', '#808080', '#FF0000', '#FF9900', '#99CC00', '#339966', '#33CCCC', '#3366FF', '#800080', '#999999', '#FF00FF', '#FFCC00', '#FFFF00', '#00FF00', '#00FFFF', '#00CCFF', '#993366', '#C0C0C0', '#FF99CC', '#FFCC99', '#FFFF99', '#CCFFCC', '#CCFFFF', '#99CCFF', '#CC99FF', '#FFFFFF'];
      scope.pick = function(color) {
        scope.onPick({
          color: color
        });
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
        for (var i = 0; i < document.getElementsByClassName('colors-grid').length; i += 1) {
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
  }]);

  angular.module('ngTinyEditor').directive('symbolsGrid', ['$compile', '$document', function($compile, $document) {
    var linker = function(scope, element, attrs, ctrl) {
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
      scope.pick = function(symbol) {
        scope.onPick({
          symbol: symbol
        });
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
        for (var i = 0; i < document.getElementsByClassName('symbols-grid').length; i += 1) {
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
      template: '<ul ng-show="show" class="symbols-grid"><li ng-repeat="symbol in symbols" unselectable="on" ng-click="pick(symbol)" ng-bind-html="symbol | to_trusted"></li></ul>'
    }
  }]);

  // ng-bind-html "htmlContent | to_trusted" 
  angular.module('ngTinyEditor').filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
      return $sce.trustAsHtml(text);
    }
  }])
  
  angular.module('ngTinyEditor').directive('tinyedit', ['$compile', '$timeout', '$q', function($compile, $timeout, $q) {
    var linker = function(scope, $element, attrs, ctrl) {
      scope.editMode = false;
      scope.cursorStyle = {};
      //current cursor/caret position style
      scope.fonts = ['Verdana', 'Arial', 'Arial Black', 'Arial Narrow', 'Courier New', 'Century Gothic', 'Comic Sans MS', 'Georgia', 'Impact', 'Tahoma', 'Times', 'Times New Roman', 'Webdings', 'Trebuchet MS'];
      /*
	    scope.$watch('font', function(newValue) {
    		if(newValue) {
    		  scope.execCommand( 'fontname', newValue );
    		  scope.font = '';
    		}
	    });
	    */
      scope.fontChange = function() {
        scope.execCommand('fontname', scope.font);
        //scope.font = '';
      }
      scope.fontsizes = [{
        key: 1,
        name: 'x-small'
      }, {
        key: 2,
        name: 'small'
      }, {
        key: 3,
        name: 'normal'
      }, {
        key: 4,
        name: 'large'
      }, {
        key: 5,
        name: 'x-large'
      }, {
        key: 6,
        name: 'xx-large'
      }, {
        key: 7,
        name: 'xxx-large'
      }];
      scope.mapFontSize = {
        10: 1,
        13: 2,
        16: 3,
        18: 4,
        24: 5,
        32: 6,
        48: 7
      };
      scope.sizeChange = function() {
        scope.execCommand('fontsize', scope.fontsize);
      }
      /*
	    scope.$watch('fontsize', function(newValue) {
    		if(newValue) {
  		    scope.execCommand( 'fontsize', newValue );
  		    scope.fontsize = '';
    		}
	    });
	    */
      scope.styles = [{
        name: '段落',
        key: '<p>'
      }, {
        name: '标题 1',
        key: '<h1>'
      }, {
        name: '标题 2',
        key: '<h2>'
      }, {
        name: '标题 3',
        key: '<h3>'
      }, {
        name: '标题 4',
        key: '<h4>'
      }, {
        name: '标题 5',
        key: '<h5>'
      }, {
        name: '标题 6',
        key: '<h6>'
      }];
      scope.styleChange = function() {
        scope.execCommand('formatblock', scope.textstyle);
      }
      /*
	    scope.$watch('textstyle', function(newValue) {
		    if(newValue) {
		      scope.execCommand( 'formatblock', newValue );
		      scope.fontsize = '';
		    }
	    });
	    */
      scope.execCommand = function(cmd, arg) {
        scope.$emit('execCommand', {
          command: cmd,
          arg: arg
        });
      }

      scope.showFontColors = false;
      scope.setFontColor = function(color) {
        scope.execCommand('foreColor', color);
      }

      scope.showBgColors = false;
      scope.setBgColor = function(color) {
        scope.execCommand('hiliteColor', color);
      }
      
      scope.showSpecChars = false;
      scope.insertSpecChar = function(symbol) {
        console.log(1)
        scope.execCommand('insertHTML', symbol);
      }
      scope.insertLink = function() {
        var val = prompt('请输入链接地址', 'http://');
        if (val)
          scope.execCommand('createlink', val);
      }

      /*
	    * insert image button
	    */
      scope.insertImage = function() {
        var val;
        if (scope.api && scope.api.insertImage && angular.isFunction(scope.api.insertImage)) {
          val = scope.api.insertImage.apply(scope.api.scope || null );
        } 
        else {
          val = prompt('请输入图片地址', 'http://');
          // 修复原空值或者取消输入都会插入图片
          // val = '<img src="' + val + '">';
          if(!val || val=='http://' || val=="https://"){
            return false;
          }else{
            scope.execCommand('insertHTML', '<img src="' + val + '">');
          }
          //we convert into HTML element.
        }
        //resolve the promise if any
        // $q.when(val).then(function(data) {
        //   scope.execCommand('insertimage', val);
        //   scope.execCommand('insertHTML', data);
        //   we insert image as an HTML element instead of giving the editor a direct command to insert an image with url
        // });
      }

      // 页面内全屏
      scope.fsData={
        'isFullScreen':false,
        'width':$element[0].offsetWidth,
        'sizerHeight':$element[0].children[1].offsetHeight
      };
      scope.fullScreen=function(){
        scope.fsData.isFullScreen=!scope.fsData.isFullScreen;
        if(scope.fsData.isFullScreen){
          $element.css({
            'position':'fixed',
            'top':0,
            'left':0,
            'width':window.innerWidth+'px',
            'zIndex':9999
          });
          $element[0].children[1].style.height=window.innerHeight-72+'px';
        }else{
          $element.css({
            'position':'relative',
            'width':scope.fsData.width+'px',
            'zIndex':30
          });
          $element[0].children[1].style.height=scope.fsData.sizerHeight+'px';
        }
        
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
        for (var i = 0; i < document.getElementsByClassName('tinyeditor-header').length; i += 1) {
          makeUnselectable(document.getElementsByClassName("tinyeditor-header")[i]);
        }
      });
      //catch the cursort position style
      scope.$on('cursor-position', function(event, data) {
        //console.log('cursor-position', data);
        scope.cursorStyle = data;
        scope.font = data.font.replace(/(')/g, '');
        //''' replace single quotes
        scope.fontsize = scope.mapFontSize[data.size] ? scope.mapFontSize[data.size] : 0;
      });
    }
    return {
      link: linker,
      scope: {
        content: '=',
        //this is our content which we want to edit
        api: '='//this is our api object
      },
      restrict: 'AE',
      replace: true,
      template: template
    }
  }
  ]);

}
)(angular);
