define([
  'jquery',
  'underscore',
  'backbone',
  'views/_general',
  'text!templates/login.html',
],
  function ($, _, Backbone, View, tpl) {
    var login = View.extend({
      name: 'login',
      events: {
        'submit #login-form': 'doLogin',
      },

      render: function () {
        $('#content-view').html(tpl);
      },

      doLogin: function (e) {
        if (e.isDefaultPrevented()) {
          return;
        }
        e.preventDefault();

        var user = $("#user").val();
        var pass = $("#pass").val();

        if (user == '' || pass == '') {
          alert('Incorrect values.');
          return;
        }

        $.ajax({
          type: "POST",
          url: API + "login",
          dataType: 'json',
          data: JSON.stringify({
            'user': user,
            'pass': pass,
          }),
          contentType: 'application/json',
          success: function (data) {
            if (!data.success) {
              alert("Unable to login!");
            } else {
              router.navigate('calc', {
                trigger: true
              });
            }
          },
          error: function (e, data) {
            if (e.responseJSON != undefined) {
              alert(e.responseJSON.userMessage);
            } else {
              alert("Unable to login!");
            }
          }
        })
      }
    });

    return login;
  });
