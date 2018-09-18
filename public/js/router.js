define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {
  return Backbone.Router.extend({
    currentView: null,
    currentModule: null,
    routes: {
      'logout': 'doLogout',
      ':view': 'showModule',
      ':view/:sub': 'showSubModule',
      ':view/:sub/:param': 'showSubModuleWithParam',
      ':view/:sub/:param/:next': 'showSubModuleWithParamAndNext',
      '*actions': 'defaultAction'
    },

    showModule: function (view, sub, param, next) {
      var that = this;
      var view = "views/" + view;
      require([view], function (SelectedView) {
        that.currentView = new SelectedView(sub, param, next);
      });
    },

    showSubModule: function (view, sub) {
      this.currentModule = this.genModuleName(sub);

      if (this.currentView && this.currentView.name == view) {
        if (typeof this.currentView[this.currentModule] == 'function') {
          this.currentView[this.currentModule]();
        }
      } else {
        this.showModule(view, this.currentModule);
      }
    },

    showSubModuleWithParam: function (view, sub, param) {
      this.currentModule = this.genModuleName(sub);
      if (this.currentView && this.currentView.name == view) {
        if (typeof this.currentView[this.currentModule] == 'function') {
          this.currentView.params = param;
          this.currentView.next = null;
          this.currentView[this.currentModule]();
        }
      } else {
        this.showModule(view, this.currentModule, param);
      }
    },

    showSubModuleWithParamAndNext: function (view, sub, param, next) {
      this.currentModule = this.genModuleName(sub);
      if (this.currentView && this.currentView.name == view) {
        if (typeof this.currentView[this.currentModule] == 'function') {
          this.currentView.params = param;
          this.currentView.next = next.split(".");
          this.currentView[this.currentModule]();
        }
      } else {
        this.showModule(view, this.currentModule, param, next);
      }
    },

    genModuleName: function (input) {
      var words = input.split('-');
      var mod = "render";
      for (var i in words) {
        words[i] = (words[i] == '!') ? 'main' : words[i];
        mod += capitalize(words[i]);
      }
      return mod;
    },

    doLogout: function () {
      cleanStorage();
      this.menuRendered = false;
      this.navigate('login', {
        trigger: true
      });
    },

    defaultAction: function () {
      router.navigate('login', {
        trigger: true
      });
    },

    execute: function (callback, args, name) {
      $(".navbar-collapse").collapse('hide');
      if (this.currentView && this.currentView.name != args[0]) {
        this.currentView.cleanup();
      }
      if (!this.menuRendered && !_.contains(this.beforeLogin, args[0])) {
        $('#top-menu').show();
        this.menuRendered = true;
      } else if (_.contains(this.beforeLogin, args[0])) {
        $('#top-menu').hide();
        this.menuRendered = false;
      }

      if (callback) callback.apply(this, args);
    },
    menuRendered: false,

    beforeLogin: ['login']
  });
});
