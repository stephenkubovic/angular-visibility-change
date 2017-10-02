(function() {

'use strict';

var module = angular.module('visibilityChange', []);

module.service('VisibilityChange', ['$document', '$rootScope', '$timeout', function($document, $rootScope, $timeout) {

  var broadcastVisibleEvent = 'pageBecameVisible',
      broadcastHiddenEvent = 'pageBecameHidden',
      broadcastEnabled = false,
      hidden = 'hidden',
      changeCallbacks = {},
      visibleCallbacks = {},
      hiddenCallbacks = {},
      $doc = $document[0],
      visibilityChange;

  this.configure = function(config) {
    if (typeof config !== 'object') {
      throw new Error(config + ' is not a valid configuration object');
    }

    if (config.broadcast === true) {
      broadcastEnabled = true;
    } else if (typeof config.broadcast === 'object') {
      broadcastEnabled = true;
      broadcastVisibleEvent = config.broadcast.visible || broadcastVisibleEvent;
      broadcastHiddenEvent = config.broadcast.hidden || broadcastHiddenEvent;
    }
  };

  this.onChange = function(callback, id) {
    pushNewCallback(changeCallbacks, callback, id);
  };

  this.onVisible = function(callback, id) {
    pushNewCallback(visibleCallbacks, callback, id);
  };

  this.onHidden = function(callback, id) {
    pushNewCallback(hiddenCallbacks, callback, id);
  };

  this.deregisterChangeCallback = function(id) {
    delete changeCallbacks[id];
  };

  this.deregisterVisibleCallback = function(id) {
    delete visibleCallbacks[id];
  };

  this.deregisterHiddenCallback = function(id) {
    delete hiddenCallbacks[id];
  };

  if (hidden in $doc) {
    visibilityChange = 'visibilitychange';
  } else if ((hidden = 'webkitHidden') in $doc) {
    visibilityChange = 'webkitvisibilitychange';
  } else if ((hidden = 'mozHidden') in $doc) {
    visibilityChange = 'mozvisibilitychange';
  } else if ((hidden = 'msHidden') in $doc) {
    visibilityChange = 'msvisibilitychange';
  } else {
    return;
  }

  var pushNewCallback = function(callbacks, newCallBack, id) {
    if (typeof id === 'undefined') {
      id = 'DUMMY_ID';
    }
    if (!(id in changeCallbacks)) {
      callbacks[id] = [];
    }

    callbacks[id].push(newCallBack);
  };

  var onVisibilityChange = function() {
    $timeout(function() {
      if ($document[0][hidden]) {
        notifyHidden();
      } else {
        notifyVisible();
      }
    }, 100);
  };

  var execCallbacks = function() {
    var args = Array.prototype.slice.call(arguments),
        callbacks = args.shift();

    for (var id in callbacks) {
      if (callbacks.hasOwnProperty(id)) {
        for (var i = 0; i < callbacks[id].length; i++) {
          callbacks[id][i].apply(null, args);
        }
      }
    }
  };

  var notifyHidden = function() {
    if (broadcastEnabled) {
      $rootScope.$broadcast(broadcastHiddenEvent);
    }
    execCallbacks(changeCallbacks, false);
    execCallbacks(hiddenCallbacks);
  };

  var notifyVisible = function() {
    if (broadcastEnabled) {
      $rootScope.$broadcast(broadcastVisibleEvent);
    }
    execCallbacks(changeCallbacks, true);
    execCallbacks(visibleCallbacks);
  };

  $document.on(visibilityChange, onVisibilityChange);
}]);

})();
