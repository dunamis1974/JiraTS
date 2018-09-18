define(['underscore', 'backbone'], function(_, Backbone) {
  var GeneralModel = Backbone.Model.extend({
    url: "",
    collections: {},

    parse: function(response) {
      if (checkForError(response).code == 401) {
        return {};
      }

      for (var key in this.model) {
        if (response[key] != undefined && response[key].cid == undefined) {
          var embeddedClass = this.model[key];
          var embeddedData = response[key];
          response[key] = new embeddedClass(embeddedData);
        }
      }

      for (var key in this.collections) {
        var embeddedClass = this.collections[key];
        var embeddedData = response[key];
        response[key] = new embeddedClass(embeddedData, {parse: true});
      }

      return response;
    }

  });
  return GeneralModel;
});
