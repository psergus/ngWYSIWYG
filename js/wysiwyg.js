'use strict';
(function(angular) {

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
	};

	angular.module('ngWYSIWYG', ['ngSanitize']);
	var editorTemplate = "<div class=\"tinyeditor\">" +
		"<div class=\"tinyeditor-header\" ng-hide=\"editMode\">" +
		"{toolbar}" + // <-- we gonna replace it with the configured toolbar
		"<div style=\"clear: both;\"></div>" +
		"</div>" +
		"<div class=\"sizer\" ngp-resizable>" +
		"<textarea data-placeholder-attr=\"\" style=\"-webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; resize: none; width: 100%; height: 100%;\" ng-show=\"editMode\" ng-model=\"content\"></textarea>" +
		"<iframe style=\"-webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; width: 100%; height: 100%;\" ng-hide=\"editMode\" wframe=\"{sanitize: config.sanitize}\" content-style=\"{contentStyle}\" ng-model=\"content\"></iframe>" +
		"</div>" +
		"<div class=\"tinyeditor-footer\">" +
		"<div ng-switch=\"editMode\" ng-click=\"editMode = !editMode\" class=\"toggle\"><span ng-switch-when=\"true\">wysiwyg</span><span ng-switch-default>source</span></div>" +
		"</div>" +
		"</div>";

//debug sanitize
	angular.module('ngWYSIWYG').config(['$provide',
		//http://odetocode.com/blogs/scott/archive/2014/09/10/a-journey-with-trusted-html-in-angularjs.aspx
		function($provide) {
			$provide.decorator("$sanitize",['$delegate', '$log', function($delegate, $log) {
				return function(text, target) {
					var result = $delegate(text, target);
					//$log.info("$sanitize input: " + text);
					//$log.info("$sanitize output: " + result);
					return result;
				};
			}]);
		}
	]);
	angular.module('ngWYSIWYG').directive('wframe', ['$compile', '$timeout', '$sanitize',
		function($compile, $timeout, $sanitize) {
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

				// fixing issue that makes caret disappear on chrome (https://github.com/psergus/ngWYSIWYG/issues/22)
				$document.addEventListener('click', function(event) {
					if (event.target.tagName === 'HTML') {
						event.target.querySelector('body').focus();
					}
				});

				// this option enables you to specify a custom CSS to be used within the editor (the editable area)
				if (attrs.contentStyle) {
					$head.append('<link rel="stylesheet" type="text/css" href="' + attrs.contentStyle + '">');
				}

				/*
				 $element.bind('load', function (event) {
				 console.log('iframe loaded');
				 $document.designMode = 'On';
				 });
				 */

				//model --> view
				ctrl.$render = function() {
					//$body.html(ctrl.$viewValue || ''); //not friendly with jQuery. snap you jQuery
					console.log(scope.config);
					//sanitize the input only if defined through config
					$body[0].innerHTML = ctrl.$viewValue? ( (scope.config && scope.config.sanitize)? $sanitize(ctrl.$viewValue) : ctrl.$viewValue) : '';
				};

				scope.sync = function() {
					scope.$evalAsync(function(scope) {
						ctrl.$setViewValue($body.html());
					});
				};

				var debounce = null; //we will debounce the event in case of the rapid movement. Overall, we are intereseted in the last cursor/caret position
				//view --> model
				$body.bind('click keyup change paste', function() { //we removed 'blur' event
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
				};
				scope.restoreSelection = function() {
					if(scope.range && $document.getSelection) {
						var sel = $document.getSelection();
						sel.removeAllRanges();
						sel.addRange(scope.range);
					}
				};

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

				scope.$on('insertElement', function(event, html) {
					var sel, range;
					if ($document.defaultView.getSelection) {
						sel = $document.defaultView.getSelection();
						if (sel.getRangeAt && sel.rangeCount) {
							range = sel.getRangeAt(0);
							range.deleteContents();

							// Range.createContextualFragment() would be useful here but is
							// only relatively recently standardized and is not supported in
							// some browsers (IE9, for one)
							var el = $document.createElement("div");
							el.innerHTML = html;
							var frag = $document.createDocumentFragment(), node, lastNode;
							while ((node = el.firstChild)) {
								lastNode = frag.appendChild(node);
							}
							var firstNode = frag.firstChild;
							range.insertNode(frag);

							// Preserve the selection
							if (lastNode) {
								range = range.cloneRange();
								range.setStartAfter(lastNode);
								range.collapse(true);
								sel.removeAllRanges();
								sel.addRange(range);
							}
						}
					} else if ($document.selection && $document.selection.type != "Control") {
						// IE < 9
						$document.selection.createRange().pasteHTML(html);
					}
					scope.sync();
				});

				scope.$on('$destroy', function() {
					//clean after myself

				});

				//init
				try {
					$document.execCommand("styleWithCSS", 0, 0); // <-- want the Old Schoold elements like <b> or <i>, comment this line. kudos to: http://stackoverflow.com/questions/3088993/webkit-stylewithcss-contenteditable-not-working
					$document.execCommand('enableObjectResizing', 0, true);
					$document.execCommand('contentReadOnly', 0, 'false');
				}
				catch(e) {
					try {
						$document.execCommand("useCSS", 0, 1);
					}
					catch(e) {
					}
				}
			};
			return {
				link: linker,
				require: 'ngModel',
				scope: {
					config: '=wframe'
				},
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
				};
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
			};
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
				};
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
			};
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

				var iframe = null;
				var iframeDocument = null;
				var iframeWindow = null;

				function loadVars() {
					if (iframe != null) return;
					iframe = document.querySelector('wysiwyg-edit').querySelector('iframe');
					iframeDocument = iframe.contentDocument;
					iframeWindow = iframeDocument.defaultView;
				}

				function insertElement(html) {
					scope.$broadcast('insertElement', html);
				}

				scope.panelButtons = {
					'-': { type: 'div', class: 'tinyeditor-divider' },
					bold: { type: 'div', title: 'Bold', class: 'tinyeditor-control', faIcon: 'bold', backgroundPos: '34px -120px', pressed: 'bold', command: 'bold' },
					italic:{type: 'div', title: 'Italic', class: 'tinyeditor-control', faIcon: 'italic', backgroundPos: '34px -150px', pressed: 'italic', command: 'italic' },
					underline:{ type: 'div', title: 'Underline', class: 'tinyeditor-control', faIcon: 'underline', backgroundPos: '34px -180px', pressed: 'underline', command: 'underline' },
					strikethrough:{ type: 'div', title: 'Strikethrough', class: 'tinyeditor-control', faIcon: 'strikethrough', backgroundPos: '34px -210px', pressed: 'strikethrough', command: 'strikethrough' },
					subscript:{ type: 'div', title: 'Subscript', class: 'tinyeditor-control', faIcon: 'subscript', backgroundPos: '34px -240px', pressed: 'sub', command: 'subscript' },
					superscript:{ type: 'div', title: 'Superscript', class: 'tinyeditor-control', faIcon: 'superscript', backgroundPos: '34px -270px', pressed: 'super', command: 'superscript' },
					leftAlign:{ type: 'div', title: 'Left Align', class: 'tinyeditor-control', faIcon: 'align-left', backgroundPos: '34px -420px', pressed: 'alignmet == \'left\'', command: 'justifyleft' },
					centerAlign:{ type: 'div', title: 'Center Align', class: 'tinyeditor-control', faIcon: 'align-center', backgroundPos: '34px -450px', pressed: 'alignment == \'center\'', command: 'justifycenter' },
					rightAlign:{ type: 'div', title: 'Right Align', class: 'tinyeditor-control', faIcon: 'align-right', backgroundPos: '34px -480px', pressed: 'alignment == \'right\'', command: 'justifyright' },
					blockJustify:{ type: 'div', title: 'Block Justify', class: 'tinyeditor-control', faIcon: 'align-justify', backgroundPos: '34px -510px', pressed: 'alignment == \'justify\'', command: 'justifyfull' },
					orderedList:{ type: 'div', title: 'Insert Ordered List', class: 'tinyeditor-control', faIcon: 'list-ol', backgroundPos: '34px -300px', command: 'insertorderedlist' },
					unorderedList:{ type: 'div', title: 'Insert Unordered List', class: 'tinyeditor-control', faIcon: 'list-ul', backgroundPos: '34px -330px', command: 'insertunorderedlist' },
					outdent:{ type: 'div', title: 'Outdent', class: 'tinyeditor-control', faIcon: 'outdent', backgroundPos: '34px -360px', command: 'outdent' },
					indent:{ type: 'div', title: 'Indent', class: 'tinyeditor-control', faIcon: 'indent', backgroundPos: '34px -390px', command: 'indent' },
					removeFormatting:{ type: 'div', title: 'Remove Formatting', class: 'tinyeditor-control', faIcon: 'eraser', backgroundPos: '34px -720px', command: 'removeformat' },
					undo:{ type: 'div', title: 'Undo', class: 'tinyeditor-control', faIcon: 'undo', backgroundPos: '34px -540px', command: 'undo' },
					redo:{ type: 'div', title: 'Redo', class: 'tinyeditor-control', faIcon: 'repeat', backgroundPos: '34px -570px', command: 'redo' },
					fontColor:{ type: 'div', title: 'Font Color', class: 'tinyeditor-control', faIcon: 'font', backgroundPos: '34px -779px', specialCommand: 'showFontColors = !showFontColors', inner: '<colors-grid show=\"showFontColors\" on-pick=\"setFontColor(color)\"><colors-grid>' },
					backgroundColor:{ type: 'div', title: 'Background Color', class: 'tinyeditor-control', faIcon: 'paint-brush', backgroundPos:'34px -808px', specialCommand: 'showBgColors = !showBgColors', inner: '<colors-grid show=\"showBgColors\" on-pick=\"setBgColor(color)\"><colors-grid>' },
					image:{ type: 'div', title: 'Insert Image', class: 'tinyeditor-control', faIcon: 'picture-o', backgroundPos: '34px -600px', specialCommand: 'insertImage()' },
					hr:{ type: 'div', title: 'Insert Horizontal Rule', class: 'tinyeditor-control', faIcon: '-', backgroundPos: '34px -630px', command: 'inserthorizontalrule' },
					symbols:{ type: 'div', title: 'Insert Special Symbol', class: 'tinyeditor-control', faIcon: 'cny', backgroundPos: '34px -838px', specialCommand: 'showSpecChars = !showSpecChars', inner: '<symbols-grid show=\"showSpecChars\" on-pick=\"insertSpecChar(symbol)\"><symbols-grid>' },
					link:{ type: 'div', title: 'Insert Hyperlink', class: 'tinyeditor-control', faIcon: 'link', backgroundPos: '34px -660px', specialCommand: 'insertLink()' },
					unlink:{ type: 'div', title: 'Remove Hyperlink', class: 'tinyeditor-control', faIcon: 'chain-broken', backgroundPos: '34px -690px', command: 'unlink' },
					print:{ type: 'div', title: 'Print', class: 'tinyeditor-control', faIcon: 'print', backgroundPos: '34px -750px', command: 'print' },
					font:{ type: 'select', title: 'Font', class: 'tinyeditor-font', model: 'font', options: 'a as a for a in fonts', change: 'fontChange()' },
					size:{ type: 'select', title: 'Size', class: 'tinyeditor-size', model: 'fontsize', options: 'a.key as a.name for a in fontsizes', change: 'sizeChange()' },
					format:{ type: 'select', title: 'Style', class: 'tinyeditor-size', model: 'textstyle', options: 's.key as s.name for s in styles', change: 'styleChange()' }
				};

				var usingFontAwesome = scope.config && scope.config.fontAwesome;

				function getButtonHtml(button) {
					var html = '<' + button.type;
					html += ' class="' + button.class;
					if (usingFontAwesome) {
						html += ' tinyeditor-control-fa';
					}
					html += '" ';
					if (button.type == 'div') {
						if (button.title) {
							html += 'title="' + button.title + '" ';
						}
						if (button.backgroundPos && !usingFontAwesome) {
							html += 'style="background-position: ' + button.backgroundPos + '; position: relative;" ';
						}
						if (button.pressed) {
							html += 'ng-class="{\'pressed\': cursorStyle.' + button.pressed + '}" ';
						}
						if (button.command) {
							var executable = '\'' + button.command + '\'';
							if (button.commandParameter) {
								executable += ', \'' + button.commandParameter + '\'';
							}
							html += 'ng-click="execCommand(' + executable + ')" ';
						} else if (button.specialCommand) {
							html += 'ng-click="' + button.specialCommand + '" ';
						}
						html += '>'; // this closes <div>
						if (button.faIcon && usingFontAwesome && button.faIcon != '-') {
							html += '<i class="fa fa-' + button.faIcon + '"></i>';
						}
						if (button.faIcon && usingFontAwesome && button.faIcon == '-') {
							html += '<div class="hr"></div>';
						}
						if (button.inner) {
							html+= button.inner;
						}
					} else if (button.type == 'select') {
						html += 'ng-model="' + button.model + '" ';
						html += 'ng-options="' + button.options + '" ';
						html += 'ng-change="' + button.change + '" ';
						html += '<option value="">' + button.title + '</option>';
					}
					html += '</' + button.type + '>';
					return html;
				}

				//show all panels by default
				scope.toolbar = (scope.config && scope.config.toolbar)? scope.config.toolbar : [
					{ name: 'basicStyling', items: ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'leftAlign', 'centerAlign', 'rightAlign', 'blockJustify', '-'] },
					{ name: 'paragraph', items: ['orderedList', 'unorderedList', 'outdent', 'indent', '-'] },
					{ name: 'doers', items: ['removeFormatting', 'undo', 'redo', '-'] },
					{ name: 'colors', items: ['fontColor', 'backgroundColor', '-'] },
					{ name: 'links', items: ['image', 'hr', 'symbols', 'link', 'unlink', '-'] },
					{ name: 'tools', items: ['print', '-'] },
					{ name: 'styling', items: ['font', 'size', 'format'] }
				];
				//compile the template
				var toolbarGroups = [];
				angular.forEach(scope.toolbar, function(buttonGroup, index) {
					var buttons = [];
					angular.forEach(buttonGroup.items, function(button, index) {
						var newButton = scope.panelButtons[button];
						if (!newButton) {
							// checks if it is a button defined by the user
							newButton = scope.config.buttons[button];
						}
						this.push( getButtonHtml(newButton) );
					}, buttons);
					this.push(
						"<div class=\"tinyeditor-buttons-group\">" +
						buttons.join('') +
						"</div>"
					);
				}, toolbarGroups);

				var template = editorTemplate.replace('{toolbar}', toolbarGroups.join(''));
				template = template.replace('{contentStyle}', attrs.contentStyle || '');
				//$element.replaceWith( angular.element($compile( editorTemplate.replace('{toolbar}', toolbarGroups.join('') ) )(scope)) );
				$element.html( template );
				$compile($element.contents())(scope);

				/*
				 * send the event to the iframe's controller to exec the command
				 */
				scope.execCommand = function(cmd, arg) {
					//console.log('execCommand');
					//scope.$emit('execCommand', {command: cmd, arg: arg});
					switch(cmd) {
						case 'bold':
							scope.cursorStyle.bold = !scope.cursorStyle.bold;
							break;
						case 'italic':
							scope.cursorStyle.italic = !scope.cursorStyle.italic;
							break;
						case 'underline':
							scope.cursorStyle.underline = !scope.cursorStyle.underline;
							break;
						case 'strikethrough':
							scope.cursorStyle.strikethrough = !scope.cursorStyle.strikethrough;
							break;
						case 'subscript':
							scope.cursorStyle.sub = !scope.cursorStyle.sub;
							break;
						case 'superscript':
							scope.cursorStyle.super = !scope.cursorStyle.super;
							break;
						case 'justifyleft':
							scope.cursorStyle.alignment = 'left';
							break;
						case 'justifycenter':
							scope.cursorStyle.alignment = 'center';
							break;
						case 'justifyright':
							scope.cursorStyle.alignment = 'right';
							break;
						case 'justifyfull':
							scope.cursorStyle.alignment = 'justify';
							break;
					}
					//console.log(scope.cursorStyle);
					scope.$broadcast('execCommand', {command: cmd, arg: arg});
				};


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
				};
				scope.fontsizes = [{key: 1, name: 'x-small'}, {key: 2, name: 'small'}, {key: 3, name: 'normal'}, {key: 4, name: 'large'}, {key: 5, name: 'x-large'}, {key: 6, name: 'xx-large'}, {key: 7, name: 'xxx-large'}];
				scope.mapFontSize = { 10: 1, 13: 2, 16: 3, 18: 4, 24: 5, 32: 6, 48: 7};
				scope.sizeChange = function() {
					scope.execCommand( 'fontsize', scope.fontsize );
				};
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
					scope.execCommand( 'formatblock', scope.textstyle );
				};
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
				};
				scope.showBgColors = false;
				scope.setBgColor = function( color ) {
					scope.execCommand('hiliteColor', color);
				};

				scope.showSpecChars = false;
				scope.insertSpecChar = function(symbol) {
					insertElement(symbol);
				};
				scope.insertLink = function() {
					loadVars();
					if (iframeWindow.getSelection().focusNode == null) return; // user should at least click the editor
					var elementBeingEdited = getSelectionBoundaryElement(iframeWindow, true);
					var defaultUrl = 'http://';
					if (elementBeingEdited && elementBeingEdited.nodeName == 'A') {
						defaultUrl = elementBeingEdited.href;

						// now we select the whole a tag since it makes no sense to add a link inside another link
						var selectRange = iframeDocument.createRange();
						selectRange.setStart(elementBeingEdited.firstChild, 0);
						selectRange.setEnd(elementBeingEdited.firstChild, elementBeingEdited.firstChild.length);
						var selection = iframeWindow.getSelection();
						selection.removeAllRanges();
						selection.addRange(selectRange);
					}
					var val;
					if(scope.api && scope.api.insertLink && angular.isFunction(scope.api.insertLink)) {
						val = scope.api.insertLink.apply( scope.api.scope || null, [defaultUrl]);
					} else {
						val = prompt('Please enter the URL', 'http://');
					}
					//resolve the promise if any
					$q.when(val).then(function(data) {
						scope.execCommand('createlink', data);
					});
				};
				/*
				 * insert
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
					$q.when(val).then(function(data) {
						insertElement(data);
					});
				};
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
			};
			return {
				link: linker,
				scope: {
					content: '=', //this is our content which we want to edit
					api: '=', //this is our api object
					config: '='
				},
				restrict: 'AE',
				replace: true
			}
		}
	]);

})(window.angular);
