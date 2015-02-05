# angular-visibility-change
Detect visibility change events in Angular.

## What does this do?

Uses the Page Visibility API to notify your Angular app when the page becomes hidden and visible.
Supports `document.hidden` and `visibilitychange`, as well as `ms`, `moz`, and `webkit` prefixes.
Has a callback API or can be configured to use $broadcast to notify of visibility change events.

## Examples

See the [examples](./examples') folder for basic usage.  More and better examples are on the way.

## Callback API

### onVisible(callback)

Runs the `callback` function when the page becomes visible.

### onHidden(callback)

Runs the `callback` function when the page becomes hidden.

### onChange(callback)

Runs the `callback` function whenever the page visibility changes. The callback will be called with a
single boolean argument indicating whether the page became visible.

### Examples

```javascript
angular.module('myApp', ['visibilityChange'])
  .controller('MyCtrl', function(VisibilityChange) {
    VisibilityChange.onVisible(function() {
      console.log('Page became visible');
    });

    VisibilityChange.onHidden(function() {
      console.log('Page became hidden');
    });

    VisibilityChange.onChange(function(visible) {
      if (visible) {
        console.log('Page became visible');
      } else {
        console.log('Page became hidden');
      }
    })
  });
```

## $broadcast API

If you would rather be notified of visibility events using $broadcast events,
you can configure this using the `VisibilityChange.configure()` method.

### configure(options)

Configures the `VisibilityChange` service with `options` object.

#### Options

**broadcast**

Type: `boolean` or `object`

- **boolean** - Enable broadcasting of visibility change events. Events will be broadcast
to `$rootScope`.
- **object** - Enable broadcasting and override the name of the broadcasted visibility change events.
  - *visible* - Name of event when page becomes visible. Default: `pageBecameVisible`
  - *hidden* - Name of event when page becomes hidden. Default: `pageBecameHidden`

### Examples

#### Enable broadcasting
```javascript
angular.module('myApp', ['visibilityChange'])
.run(function(VisibilityChange) {
  VisibilityChange.configure({broadcast: true});
})
.controller('MyCtrl', function($rootScope) {
  $rootScope.$on('pageBecameVisible', function() {
    console.log('Page became visible');
  });
  $rootScope.$on('pageBecameHidden', function() {
    console.log('Page became hidden');
  });
});
```

### Enable broadcasting and configure event names
```javascript
angular.module('myApp', ['visibilityChange'])
  .run(function(VisibilityChange) {
    VisibilityChange.configure({broadcast: {visible: 'myVisibleEvent'}});
  })
  .controller('MyCtrl', function($rootScope) {
    $rootScope.$on('myVisibleEvent', function() {
      console.log('Page became visible');
    });
  });
```
