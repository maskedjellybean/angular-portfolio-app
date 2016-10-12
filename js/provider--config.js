/**
 * Provider to create a config obj for Angular Portfolio App.
 * Syntax based on https://gist.github.com/Mithrandir0x/3639232.
 */

(function() {
  angular.module('portfolio')

  .provider('appConfig', function() {
    var config_obj;

    /**
     * Constructor for config obj.
     */
    function config(theme, pieces_per_row, image_ratio, target, app_path) {
      // Set the theme to use. Choose between 'blt' and 'mk'.
      this.theme = theme;
      // Set number of pieces per row. Choose between 3 and 2.
      this.pieces_per_row = pieces_per_row;
      // Set image ratio. Choose between 'portrait' or 'landscape'.
      this.image_ratio = image_ratio;
      this.target = target;
      this.app_path = app_path;

      // Configure more global config values.
      // Transition time for flipping animation. Needs to match .flip-card transition property in CSS.
      this.transition_time = 400;
      // Time between flipping animations.
      this.transition_time_between = 50;
      this.pieces_per_row_zero = this.pieces_per_row - 1;
      this.ppr_key = 'ppr_' + this.pieces_per_row.toString();
      this.transition_time_padding = this.transition_time + this.transition_time_between;
      this.transition_time_full = (this.transition_time * 2) + this.transition_time_between;
    }

    return {
      createConfig: function(theme, pieces_per_row, image_ratio, target, app_path) {
        config_obj = new config(theme, pieces_per_row, image_ratio, target, app_path);
      },
      $get: function() {
        return {
          getConfig: function() {
            return config_obj;
          }
        };
      }
    };
  });
})();