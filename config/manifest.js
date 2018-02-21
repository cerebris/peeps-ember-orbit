/* eslint-env node */
'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
    name: "Peeps Ember Orbit",
    short_name: "Peeps",
    description: "Peeps Ember Orbit",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "images/tile.png",
        sizes: "180x135",
        type: "image/png"
      }
    ]
  };
}
