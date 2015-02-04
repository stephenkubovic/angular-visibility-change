/**
 * Detect window visibility changes in Angular.
 * @version v0.0.1 - 2015-01-31
 * @link https://github.com/stephenkubovic/angular-visibility-change
 * @author Stephen Kubovic <stephen@skbvc.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */(function() {

'use strict';

var module = angular.module('visibilityChange', []);

module.provider('VisibilityChange', function() {

  var broadcastVisibleEvent = 'windowBecameVisible',
      broadcastHiddenEvent = 'windowBecameHidden',
      broadcastEnabled = true,
      loggingEnabled = true;

  var log = function(message) {
    if (typeof console.log !== 'undefined' && loggingEnabled) {
      console.log('WindowVisibility:', message);
    }
  };

  var configure = function(config) {
    config = config || {};

    if (typeof config.visibleEvent === 'boolean') {
      if (config.visibleEvent === false) {
        broadcastVisibleEvent = false;
      }
    } else if (typeof config.visibleEvent === 'string') {
      broadcastVisibleEvent = config.visibleEvent;
    }

    if (typeof config.hiddenEvent === 'boolean') {
      if (config.hiddenEvent === false) {
        broadcastVisibleEvent = false;
      }
    } else if (typeof config.hiddenEvent === 'string') {
      broadcastHiddenEvent = config.hiddenEvent;
    }

    if (config.broadcast === false) {
      broadcastEnabled = true;
    }
  };

  this.$get = ['$rootScope', '$document', function($rootScope, $document) {

    var hidden = 'hidden',
        changeCallbacks = [],
        visibleCallbacks = [],
        hiddenCallbacks = [],
        visibilityChange;

    if (hidden in $document) {
      visibilityChange = 'visibilitychange';
    } else if ((hidden = 'webkitHidden') in $document) {
      visibilityChange = 'webkitvisibilitychange';
    } else if ((hidden = 'mozHidden') in $document) {
      visibilityChange = 'mozvisibilitychange';
    } else if ((hidden = 'msHidden')) {
      visibilityChange = 'msvisibilitychange';
    } else {
      log('visibilitychange not supported in this browser');
      return;
    }

    var onVisibilityChange = function() {
      if (this[hidden]) {
        log('Window became hidden');
        notifyHidden();
      } else {
        log('Window became visible');
        notifyVisible();
      }
    };

    var execCallbacks = function() {
      var args = Array.prototype.slice.call(arguments),
          callbacks = args.shift();

      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i].apply(null, args);
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
      execCallbacks(hiddenCallbacks);
    };

    $document.on(visibilityChange, onVisibilityChange);

    return {
      onChange: function(callback) {
        changeCallbacks.push(callback);
      },
      onVisible: function(callback) {
        visibleCallbacks.push(callback);
      },
      onHidden: function(callback) {
        hiddenCallbacks.push(callback);
      },
      configure: configure
    };
  }];

});

})();
