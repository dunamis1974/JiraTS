define([
    'jquery',
    'underscore',
    'views/_general',
    'text!templates/settings.html'
  ],
  function($, _, View, tpl) {
    var SettingsView = View.extend({
      name: 'settings',
      settings: null,
      events: {

      },

      renderMain: function() {
        $("#content-view").html(tpl);
      }

    });

    return SettingsView;
  });
