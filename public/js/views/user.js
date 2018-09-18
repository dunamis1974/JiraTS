define([
    'jquery',
    'underscore',
    'views/_general',
    'text!templates/user.html'
  ],
  function($, _, View, tpl) {
    var SettingsView = View.extend({
      name: 'user',
      settings: null,
      events: {

      },

      renderMain: function() {
        $("#content-view").html(tpl);
      }

    });

    return SettingsView;
  });
