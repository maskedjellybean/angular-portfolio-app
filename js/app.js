/**
 * Main file for Angular Portfolio App.
 * Contains controllers.
 */

(function() {
  angular.module('portfolio', ['angular-flexslider'])

  /**
   * Parent Controller.
   * Set on <body> and contains all other controllers.
   */
  .controller('PortfolioController', ['$scope', '$timeout', '$window', 'rowsFactory', 'appConfig', function ($scope, $timeout, $window, rowsFactory, appConfig) {

    $scope.overflow_hidden = false;
    // Retrieve app config from provider.
    var config = appConfig.getConfig();
    // Assign config to scope so it can be accessed in template.
    $scope.theme = config.theme;
    $scope.image_ratio = config.image_ratio;
    $scope.pieces_per_row = config.pieces_per_row;
    $scope.app_path = config.app_path;

    // Call factory, returns obj of pieces divided into rows
    if (!$scope.rows) {
      rowsFactory.getRows()
      .then(function(rows) {
        $scope.rows = rows;
      });
    }

    // Bind to window resize, determine which controller/views to use
    $scope.$watch(function() {
      return $window.innerWidth;
    }, function(value) {
      $scope.window_width = value;
    });
  }])

  /**
   * Desktop Controller.
   * Used for large browser size.
   */
  .controller('desktopController', ['$scope', '$q', '$timeout', '$interval', '$window', 'appConfig', function ($scope, $q, $timeout, $interval, $window, appConfig) {
    // Retrieve app config from provider.
    var config = appConfig.getConfig();
    // True whenever any piece is active (show more is clicked).
    var show_more_active = false;
    // Keep track of currently active row and piece, false if no active.
    var active_row = false;
    var active_piece = false;
    var active_scroll_pos = 0;
    var scroll_timeout = false;
    var flip_start_counter = 0;
    var flip_complete_counter = 0;
    // True if any pieces are currently in the process of transforming/flipping.
    $scope.curr_transforming = false;

    /**
     * See more functionality. Calls flipping function, calls function to fade rows.
     * Public Scope function available in View.
     * @param  event: The event object. Can also be null.
     * @param  origin_row: Row that contains piece that was clicked to trigger flipping.
     * @param  origin_piece: Piece that was clicked to trigger flipping.
     * @param  origin_close_button: Boolean. Whether or not flipping was triggered by close button.
     */
    $scope.showMoreToggle = function(event, origin_row, origin_piece, origin_close_button) {
      if (event) {
        event.stopPropagation();
      }
      // If no pieces are currently in the process of flipping.
      if (!$scope.curr_transforming) {
        // If no piece is open, open clicked piece.
        if (!show_more_active) {
          show_more_active = true;
          active_row = origin_row;
          active_piece = origin_piece;
          $scope.rows[config.ppr_key][active_row]['toggles']['active_row'] = true;
          active_scroll_pos = $window.pageYOffset;

          // Flip active piece
          flipActiveToBack(active_row, active_piece).then(flipCompleteTracker);
          // Flip neighbor piece(s)
          for (var p = 0; p <= config.pieces_per_row_zero; p++) {
            if (p != active_piece) {
              flipFrontToNeighbor(active_row, active_piece, p).then(flipCompleteTracker);
            }
          }

          // Fade other pieces
          for (var r = 0; r <= config.row_count_zero; r++) {
            // If not active row
            if (r != active_row) {
              var toggles = $scope.rows[config.ppr_key][r]['toggles'];
              for (var p = 0; p <= config.pieces_per_row_zero; p++) {
                toggles[p].notFlippable = true;
                toggles[p].fade = true;
              }
            }
          }
        }
        // Close open piece
        else {
          // Don't allow click on active piece to trigger flipping.
          if (origin_close_button || origin_row != active_row || (origin_row == active_row && origin_piece != active_piece)) {
            // Flip neighbor piece(s)
            for (var p = 0; p <= config.pieces_per_row_zero; p++) {
              if (p != active_piece) {
                flipNeighborToFront(active_row, active_piece, p).then(flipCompleteTracker);
              }
            }
            // Flip active piece
            flipActiveToFront(active_row, active_piece).then(flipCompleteTracker);

            // Unfade other pieces
            for (var r = 0; r <= config.row_count_zero; r++) {
              // If not active row
              if (r != active_row) {
                var toggles = $scope.rows[config.ppr_key][r]['toggles'];
                for (var p = 0; p <= config.pieces_per_row_zero; p++) {
                  toggles[p].notFlippable = false;
                  toggles[p].fade = false;
                }
              }
            }

            // Wait til flipping is complete to reset scope and global vars.
            $timeout(function() {
              $scope.rows[config.ppr_key][active_row]['toggles']['active_row'] = false;
              show_more_active = false;
              active_row = false;
              active_piece = false;
            }, config.transition_time_full);
          }
        }
      }
    };

    /**
     * Initiates interval that checks scroll position and closes active
     * piece at specific scroll distance.
     * Private function.
     */
    (function scrollToggleBind() {
      $interval(function() {
        if (show_more_active && !scroll_timeout && !$scope.curr_transforming) {
          var scroll_diff = Math.abs($window.pageYOffset - active_scroll_pos);
          if (scroll_diff > 250) {
            scroll_timeout = true;
            $scope.showMoreToggle(null, active_row, active_piece, true);
            $timeout(function() {
              scroll_timeout = false;
            }, config.transition_time_full);
          }
        }
      }, 1000);
    })();

    /**
     * Updates vars that track whether pieces are currently flipping.
     * Called when a piece starts flipping.
     * Private function.
     */
    function flipStartTracker() {
      if (flip_start_counter === 0) {
        $scope.$parent.overflow_hidden = true;
        $scope.curr_transforming = true;
      }
      if (flip_start_counter < config.pieces_per_row) {
        flip_start_counter++;
      }
    }

    /**
     * Updates vars that track whether pieces are currently flipping.
     * Called when piece has completed flipping.
     * Private function.
     */
    function flipCompleteTracker() {
      flip_complete_counter++;
      if (flip_complete_counter == config.pieces_per_row) {
        // Wait a bit after flipping is complete before allowing pieces to be flipped again.
        $timeout(function() {
          flip_start_counter = 0;
          flip_complete_counter = 0;
          $scope.curr_transforming = false;
          // Return overflow-y to <body>. Fixes firefox bug where scrollbars appear for a split second.
          $scope.$parent.overflow_hidden = false;
        }, 50);
      }
    }

    /**
     * Flips active piece from back/description to front/primary image. (Close active piece).
     * Private function.
     * @param  active_row: The active row at the time function was called.
     * @param  active_piece: The active piece at the time the function was called.
     */
    function flipActiveToFront(active_row, active_piece) {
      flipStartTracker();
      var deferred = $q.defer();
      var toggles = $scope.rows[config.ppr_key][active_row]['toggles'];
      $timeout(function() {
        transformingClassToggle(active_row, active_piece);
        $timeout(function() {
          toggles[active_piece].showMoreActive = false;
          toggles[active_piece].descriptionActive = false;
        }, config.transition_time).then(function() {
          deferred.resolve();
        });
      }, config.transition_time_padding);
      return deferred.promise;
    }

    /**
     * Flips active piece from front/primary image to back/description. (Open active piece).
     * Private function.
     * @param  active_row: The active row at the time function was called.
     * @param  active_piece: The active piece at the time the function was called.
     */
    function flipActiveToBack(active_row, active_piece) {
      flipStartTracker();
      var deferred = $q.defer();
      var toggles = $scope.rows[config.ppr_key][active_row]['toggles'];
      toggles[active_piece].showMoreActive = true;
      toggles[active_piece].descriptionActive = true;
      transformingClassToggle(active_row, active_piece);
      $timeout(function() {
      }, config.transition_time).then(function() {
        deferred.resolve();
      });
      return deferred.promise;
    }

    /**
     * Flips non-active piece from front/primary image to back/neighbor image.
     * Private function.
     * @param  active_row: The active row at the time function was called.
     * @param  active_piece: The active piece at the time the function was called.
     * @param  piece: The piece that is being flipped.
     */
    function flipFrontToNeighbor(active_row, active_piece, piece) {
      flipStartTracker();
      var deferred = $q.defer();
      var toggles = $scope.rows[config.ppr_key][active_row]['toggles'];
      $timeout(function() {
        // Show neighbor image on back face
        toggles[piece]['hideBackNbrImg_' + active_piece.toString()] = false;
        // Hide description
        toggles[piece].descriptionActive = false;
        toggles[piece].notFlippable = true;
        // Flip
        transformingClassToggle(active_row, piece);
        $timeout(function() {
        }, config.transition_time).then(function() {
          deferred.resolve();
        });
      }, config.transition_time_padding);
      return deferred.promise;
    }

    /**
     * Flips non-active piece from back/neighbor image to front/primary image.
     * Private function.
     * @param  active_row: The active row at the time function was called.
     * @param  active_piece: The active piece at the time the function was called.
     * @param  piece: The piece that is being flipped.
     */
    function flipNeighborToFront(active_row, active_piece, piece) {
      flipStartTracker();
      var deferred = $q.defer();
      var toggles = $scope.rows[config.ppr_key][active_row]['toggles'];
      // Return Primary and hide neighboring images
      toggles[piece].descriptionActive = false;
      toggles[piece].notFlippable = false;
      transformingClassToggle(active_row, piece);
      $timeout(function() {
        // Hide neighbor image after flip
        toggles[piece]['hideBackNbrImg_' + active_piece.toString()] = true;
        deferred.resolve();
      }, config.transition_time);
      return deferred.promise;
    }

    /**
     * Adds and removes CSS class during flipping animation.
     * Private function.
     * @param  active_row: The active row at the time function was called.
     * @param  piece: The piece to apply CSS classes to.
     */
    function transformingClassToggle(active_row, piece) {
      var toggles = $scope.rows[config.ppr_key][active_row]['toggles'];
      toggles[piece].transforming = true;
      toggles[piece].transform = toggles[piece].transform ? false : true;
      // Hide flip help
      toggles[piece].frontHover = false;

      $timeout(function() {
        toggles[piece].transforming = false;
      }, config.transition_time);
    }
  }])

  /**
   * Mobile Controller.
   */
  .controller('mobileController', ['$scope', '$window', function ($scope, $window) {

  }]);
})();