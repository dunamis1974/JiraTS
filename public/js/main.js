require.config({
  urlArgs: 'v=0.1',
  paths: {
    jquery: 'libs/jquery/jquery',
    treegridBs: 'libs/jquery/jquery.treegrid.bootstrap3',
    treegrid: 'libs/jquery/jquery.treegrid',
    storage: 'libs/jquery/storage',
    underscore: 'libs/underscore/underscore',
    backbone: 'libs/backbone/backbone',
    templates: '../templates',
    bootstrap: 'bootstrap',
    growl: 'growl',
    cropper: 'libs/cropper/cropper',
    xlsx: 'xlsx.full.min'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'jquery': {
      exports: '$'
    },
    'storage': {
      deps: ['jquery'],
      exports: '$'
    },
    'treegrid': {
      deps: ['jquery'],
      exports: '$'
    },
    'treegridBs': {
      deps: ['jquery', 'treegrid'],
      exports: '$'
    },
    'bootstrap': {
      deps: ['jquery'],
      exports: '$'
    },
    'underscore': {
      exports: '_'
    }
  }
});

require([
  'jquery',
  'treegrid',
  'treegridBs',
  'storage',
  'underscore',
  'backbone',
  'router',
  'bootstrap'
],
  function ($, treegrid, treegridBs, storage, _, Backbone, Router, Bootstrap) {
    router = new Router();
    Backbone.history.start();
    setupAjax();
  }
);
