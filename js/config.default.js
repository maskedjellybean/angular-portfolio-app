/**
 * Default configuration for Portfolio App.
 * Do not use this file. Copy it to config.js and make any changes.
 * See: provider--config.js for options.
 */

(function() {
  angular.module('portfolio')
  .config(function(appConfigProvider) {
    appConfigProvider.createConfig('blt', 2, 'landscape', 'http://www.benteegarden.com/api/portfolio/blt/mk.jsonp?callback=JSON_CALLBACK', 'sites/all/themes/blt/angular-portfolio-app/');
  });
})();