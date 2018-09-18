define([
    'jquery',
    'underscore',
    'backbone'
  ],
  function($, _, Backbone) {
    var general = Backbone.View.extend({
      params: null,
      next: null,
      _goToPathPrevent: false,

      events: {
        'click .x-with-path': 'goToPath',
        'click .x-with-path-prevent': 'goToPathPrevent',
        'click .x-download-file': 'downloadFile'
      },

      goToPathPrevent: function(e) {
        this._goToPathPrevent = true;
      },

      initialize: function(subview, params, next) {
        this.params = params;
        this.next = null;
        if (typeof next == "string") {
          this.next = next.split(".");
        } else if (typeof next == "object") {
          this.next = next;
        }
        this.render(subview);
      },

      el: $("#content-view"),

      goToPath: function(e) {
        e.preventDefault();
        if (this._goToPathPrevent) {
          this._goToPathPrevent = false;
          return;
        }
        var path = $(e.currentTarget).data("path");
        router.navigate(path, {
          trigger: true
        });
      },

      downloadFile: function(e) {
        e.preventDefault();
        var path = $(e.currentTarget).data("path");
        window.open(FILES + path, '_blank');
      },

      changeLanguage: function(lng) {
        $.i18n.changeLanguage(lng);
        location.reload();
      },

      cleanup: function() {
        this.undelegateEvents();
        this.$el.empty();
      },

      render: function(subview) {
        this.renderInit();
        try {

          if (subview != null) {
            this[subview]();
          } else {
            this.renderMain();
          }
        } catch (e) {
          console.log(e);
          console.error("Unable to load subview: '" + subview + "' from: '" + this.name + "'");
        }
      },

      renderMain: function() {
        console.log('Main not implemented!');
      },

      renderInit: function() {},

      _tpl: function(id) {
        return _.template($("script#" + id).html());
      },

      _vtpl: function(vTpl, id) {
        if (vTpl == null) {
          return "";
        }
        return _.template(vTpl.find("script#" + id).html());
      }
    });

    general.extend = function(child) {
      var view = Backbone.View.extend.apply(this, arguments);
      view.prototype.events = _.extend({}, this.prototype.events, child.events);
      return view;
    };

    return general;
  });
