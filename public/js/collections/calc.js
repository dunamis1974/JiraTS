define(['collections/_general', 'models/_general'], function(_Collection, Model) {
  var Collection = _Collection.extend({
    model: Model,
    url: API + "calc",

    parse: function(data) {
      this.total = data.length;
      return data;
    }
  });

  return Collection;
});
