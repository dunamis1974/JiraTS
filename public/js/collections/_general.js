define(['backbone'], function(Backbone) {
  var Collection = Backbone.Collection.extend({
    total: 0,
    url: API,
    initialize: function(models, options) {},

    parse: function(data) {
      if (checkForError(data).code == 401) {
        return [];
      }
      
      this.total = data.length;
      return data;
    }
  });

  return Collection;
});
