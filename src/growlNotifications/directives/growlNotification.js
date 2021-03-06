(function () {

  function growlNotificationDirective(growlNotifications, $animate, $timeout, $parse){

    var defaults = {
      ttl: growlNotifications.options.ttl || 5000
    };

    return {

      /**
       * Allow compilation via attributes as well so custom
       * markup can be used
       */
      restrict: 'AE',

      /**
       * Create new child scope
       */
      scope: true,

      /**
       * Controller
       */
      controller: growlNotificationController,

      /**
       * Make the controller available in the directive scope
       */
      controllerAs: '$growlNotification',

      /**
       * Post link function
       *
       * @param scope
       * @param iElem
       * @param iAttrs
       * @param ctrl
       */
      link: function (scope, iElem, iAttrs, ctrl) {

        // Assemble options
        var options = angular.extend({}, defaults, scope.$eval(iAttrs.growlNotificationOptions));

        if (iAttrs.ttl) {
          options.ttl = scope.$eval(iAttrs.ttl);
        }

        if (iAttrs.growlOnEnd) {
          var endFunction = $parse(iAttrs.growlOnEnd);
          ctrl.onEnd = function() { endFunction(scope); };
        }

        // Move the element to the right location in the DOM
        $animate.move(iElem, growlNotifications.element);

        // Schedule automatic removal if TTL exists
        if (options.ttl > 0) {
          ctrl.timer = $timeout(function () {
            ctrl.remove();
            //$animate.leave(iElem);
          }, options.ttl);
        }

        scope.$on('destroy', function() {
          if(ctrl.timer && ctrl.timer.cancel) {
            ctrl.timer.cancel();
          }
        });

      }
    };

  }

  // Inject dependencies
  growlNotificationDirective.$inject = ['growlNotifications', '$animate', '$timeout', '$parse'];

  /**
   * Directive controller
   *
   * @param $element
   */
  function growlNotificationController($element, $animate) {

    /**
     * Placeholder for timer promise
     */
    this.timer = null;

    this.onEnd = null;

    /**
     * Helper method to close notification manually
     */
    this.remove = function () {

      // Remove the element
      $animate.leave($element);

      if(this.onEnd) {
        this.onEnd();
      }

      // Cancel scheduled automatic removal if there is one
      if (this.timer && this.timer.cancel) {
        this.timer.cancel();
      }
    };

  }

  // Inject dependencies
  growlNotificationController.$inject = ['$element', '$animate'];

  // Export
  angular
    .module('growlNotifications.directives')
    .directive('growlNotification', growlNotificationDirective);

})();
