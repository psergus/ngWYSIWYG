ngWYSIWYG
=========

Folks, for your judgement and, hopefully, contributions, here is the true angular WYSIWYG.
I took images and layout from the <a href="https://github.com/jessegreathouse/TinyEditor">tinyeditor</a>, so kudos to Michael Leigeber.

Here is the <a href="http://psergus.github.io/ngWYSIWYG/">Demo</a>

### Why iFrame?

A real rich text editor must reflect the true stage of the editing content. Any CSS and/or Javascript on the host page must not overide the specifics of the content.
Moreover, iframe allows to issolate your security issues (any possible Javascript code in the content may polute your window's scope).


Installation
=========================

## Requirements

1. `AngularJS` ≥ `1.2.x`
2. `Angular Sanitize` ≥ `1.2.x`

### Bower

````Shell
$ bower install ngWYSIWYG --save
```

Include the ngWYSIWYG files in your index.html:
````HTML
<link rel="stylesheet" href="bower_components/ngWYSIWYG/css/editor.css" />
<script src="bower_components/ngWYSIWYG/js/wysiwyg.js"></script>
```

Add it as module to your app.js:

````JavaScript
['ngWYSIWYG']
````

Use it wherever you want:

```HTML
<wysiwyg-edit content="your_variable"></wysiwyg-edit>
```

## API

There is an idea on the api functions to delegate some responsibilities to the customer's scope.
The first thing which is implemented is insert image delegation. By default the directive uses a simple prompt function to accept image's url. However,
there is a way to bring up a custom dialog box on the customer's side and return promise.

````JavaScript
angular.module('myApp', ['ngWYSIWYG']).
controller('demoController', ['$scope', '$q', '$timeout', function($scope, $q, $timeout) {
	$scope.your_variable = 'some HTML text here';
	$scope.api = {
		scope: $scope,
		insertImage: function() {
			var deferred = $q.defer();
			$timeout(function() {
				var val = prompt('Enter image url', 'http://');
				if(val) {
					deferred.resolve('<img src="' + val + '" style="width: 30%;">');
				}
				else {
				    deferred.reject(null);
				}
			}, 1000);
			return deferred.promise;
		}
	};
}]);
````
Make sure you feed the api object to the directive like this:

```HTML
<wysiwyg-edit content="your_variable" api="api"></wysiwyg-edit>
```

### Simple download (aka git clone/fork)

1. Include wysiwyg.js in your project using script tags.
2. Add dependency to `ngWYSIWYG` to your app module. Example: ```angular.module('myApp', ['ngWYSIWYG'])```.
3. Add element ```<wysiwyg-edit content="your_variable"></wysiwyg-edit>```.

Maintenance
=========================

### Roadmap

- Current cursor/caret position style reflection on the toolbar
- Material Design
- Implement tests
- Look for the Angular 2.0

### Issues?

If you find any, please let me know by sumbitting an issue request. I will be working on it actively.

## Contributers

Contributions are welcome and special thanks to all the contributions!

## License

[MIT license](http://opensource.org/licenses/MIT)
