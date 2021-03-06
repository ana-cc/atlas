// ~ main.js ~
// Main GLClient starter
// based on work done by @jrburke
// Configure require.js shortcut aliases
require.config({
  shim : {
    "bootstrap" : { "deps" :['jquery'] }
  },
  paths: {
    jquery: 'https://metrics.torproject.org/js/jquery-3.2.1.min',
    underscore: 'libs/underscore/underscore-min',
    backbone: 'libs/backbone/backbone.min',
    text: 'libs/require/text',
    datatables: 'libs/datatables/jquery.dataTables.min',
    datatablest: 'libs/datatables/dataTables.TorStatus',
    datatablessort: 'libs/datatables/dataTables.Sorting',
    bootstrap: 'libs/bootstrap/bootstrap.min',
    datatablesbs: 'libs/datatables/dataTables.bootstrap',
    d3js: 'libs/d3js/d3.v3.min',
    "d3-geo-projection": 'libs/d3js/d3-geo-projection.v2.min',
    "d3-geo": 'libs/d3js/d3-geo.v1.min',
    "d3-array": 'libs/d3js/d3-array.v1.min',
    topojson: 'libs/d3js/topojson.v1.min',
    jssha: 'libs/jssha/sha1',
    templates: '../templates',
    fallbackdir: 'fallback_dir'
  }

});

require([

  // Load our app module and pass it to our definition function
  'app'

  // Some plugins have to be loaded in order due to their non AMD compliance
  // Because these scripts are not "modules" they do not pass any values to the definition function below
], function(App){
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  App.initialize();
});
