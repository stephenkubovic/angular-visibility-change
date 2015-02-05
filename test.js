describe("VisibilityChange", function() {

  // The entire test suite gets run for each support vendor prefix,
  // in addition to the Page Visibility API.

  var vendorPrefixes = {
    webkit: {
      eventName: 'webkitvisibilitychange',
      property: 'webkitHidden'
    },
    ms: {
      eventName: 'msvisibilitychange',
      property: 'msHidden'
    },
    moz: {
      eventName: 'mozvisibilitychange',
      property: 'mozHidden'
    },
    w3c: {
      eventName: 'visibilitychange',
      property: 'hidden'
    }
  };

  var documentWithVendorPrefix = function(doc, prefix) {
    for (var vendor in vendorPrefixes) {
      if (vendorPrefixes[vendor].property in doc[0]) {
        delete doc[0][vendorPrefixes[vendor].property]
      }
    }
    doc[0][vendorPrefixes[prefix].property] = false;
    return doc
  }

  for (var vendor in vendorPrefixes) {
    describe (vendor, function() {
      this.vendor = vendor
      this.property = vendorPrefixes[vendor].property
      this.eventName = vendorPrefixes[vendor].eventName;

      var $rootScope,
          $document,
          $timeout,
          VisibilityChange,
          _this = this;

      beforeEach(module('visibilityChange'));

      beforeEach(inject(function($injector) {
        $rootScope = $injector.get('$rootScope');
        $document = documentWithVendorPrefix($injector.get('$document'), _this.vendor);
        VisibilityChange = $injector.get('VisibilityChange');
        $timeout = $injector.get('$timeout');
        sinon.spy($rootScope, '$broadcast');
      }));

      afterEach(function() {
        $rootScope.$broadcast.reset();
      });

      it ('invokes visible callbacks', function() {
        var vis = sinon.spy(),
        hid = sinon.spy();
        VisibilityChange.onVisible(vis);
        VisibilityChange.onHidden(hid);
        $document.triggerHandler(_this.eventName);
        $timeout.flush();
        sinon.assert.calledOnce(vis);
        sinon.assert.notCalled(hid);
      });

      it ('invokes hidden callbacks', function() {
        var vis = sinon.spy(),
        hid = sinon.spy();

        VisibilityChange.onVisible(vis);
        VisibilityChange.onHidden(hid);
        $document[0][_this.property] = true;
        $document.triggerHandler(_this.eventName);
        $timeout.flush();
        sinon.assert.calledOnce(hid);
        sinon.assert.notCalled(vis);
      });

      it ('invokes change callbacks', function() {
        var chg = sinon.spy();

        VisibilityChange.onChange(chg);
        $document.triggerHandler(_this.eventName);
        $timeout.flush();
        sinon.assert.calledOnce(chg);
        sinon.assert.calledWith(chg, true);

        chg.reset();

        $document[0][_this.property] = true;
        $document.triggerHandler(_this.eventName);
        $timeout.flush();
        sinon.assert.calledOnce(chg);
        sinon.assert.calledWith(chg, false);
      });

      it ('broadcasts visible events', function() {
        VisibilityChange.configure({broadcast: true});

        $document.triggerHandler(_this.eventName);
        $timeout.flush();

        sinon.assert.calledOnce($rootScope.$broadcast);
        sinon.assert.calledWith($rootScope.$broadcast, 'pageBecameVisible');
      });

      it ('broadcasts hidden events', function() {
        VisibilityChange.configure({broadcast: true});

        $document[0][_this.property] = true;
        $document.triggerHandler(_this.eventName);
        $timeout.flush();

        sinon.assert.calledOnce($rootScope.$broadcast);
        sinon.assert.calledWith($rootScope.$broadcast, 'pageBecameHidden');
      });

      it ('broadcasts custom events', function() {
        VisibilityChange.configure({
          broadcast: {
            visible: 'myVisibleEvent',
            hidden: 'myHiddenEvent'
          }
        });

        $document.triggerHandler(_this.eventName);
        $timeout.flush();
        sinon.assert.calledOnce($rootScope.$broadcast);
        sinon.assert.calledWith($rootScope.$broadcast, 'myVisibleEvent');

        $rootScope.$broadcast.reset();

        $document[0][_this.property] = true;
        $document.triggerHandler(_this.eventName);
        $timeout.flush();
        sinon.assert.calledOnce($rootScope.$broadcast);
        sinon.assert.calledWith($rootScope.$broadcast, 'myHiddenEvent');
      });

      it ('uses default broadcast events if none are given', function() {
        VisibilityChange.configure({broadcast: {}});

        $document.triggerHandler(_this.eventName);
        $timeout.flush();
        sinon.assert.calledOnce($rootScope.$broadcast);
        sinon.assert.calledWith($rootScope.$broadcast, 'pageBecameVisible');

        $rootScope.$broadcast.reset();

        $document[0][_this.property] = true;
        $document.triggerHandler(_this.eventName);
        $timeout.flush();
        sinon.assert.calledOnce($rootScope.$broadcast);
        sinon.assert.calledWith($rootScope.$broadcast, 'pageBecameHidden');
      });

      it ('throws an error if configuration is invalid', function() {
        sinon.spy(VisibilityChange, 'configure');
        try {
          VisibilityChange.configure();
        } catch(e) {
          assert.equal(e.message, "undefined is not a valid configuration object");
        }
        assert.isTrue(VisibilityChange.configure.threw('Error'));
      });

    });
  }
});
