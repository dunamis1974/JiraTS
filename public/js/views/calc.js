define([
  'jquery',
  'underscore',
  'xlsx',
  'views/_general',
  'collections/project',
  'collections/calc',
  'collections/issue',
  'text!templates/calc.html'
],
  function ($, _, XLSX, View, Projects, Calc, Issues, tpl) {
    var UserView = View.extend({
      name: 'calc',

      projects: null,
      calc: null,
      issues: null,
      active: 'main',

      events: {
        'submit #project-form': 'loadAllData',
        'click #export-btn': 'exportData',
        'click #export-raw-btn': 'exportRawData',
      },

      loadAllData: function (e) {

        if (e !== undefined) {
          if (e.isDefaultPrevented()) {
            return;
          }
          e.preventDefault();
        }

        if (this.active == 'components') {
          window.location.replace('./#calc/main');
          return;
        }

        this.loadProjectData();
      },

      loadProjectData: function () {

        this.issues = null;

        var that = this;
        var start = $("#startdate").val();
        var end = $("#enddate").val();
        var project = $("#project").val();

        if (!start || !end) {
          return;
        }

        this.calc = new Calc();
        this.calc.fetch({
          data: {
            'start': start,
            'end': end,
            'project': project
          },
          processData: true,
          success: function (collection, response) {
            that.loadIssuesData();
          },
          error: function (collection, response) {
            alert(response.status + " " + response.statusText);
          }
        });
      },

      loadIssuesData: function () {
        if (!this.calc) {
          return;
        }

        var that = this;

        var ids = '';
        for (let i = 0; i < this.calc.length; i++) {
          var row = this.calc.models[i];
          ids += row.get('issueKey');
          if (i < (this.calc.length - 1)) {
            ids += ',';
          }
        }

        this.issues = new Issues();
        this.issues.fetch({
          data: { 'ids': ids },
          processData: true,
          success: function (collection, response) {
            that.renderUsersData();
          },
          error: function (collection, response) {
            alert(response.status + " " + response.statusText);
          }
        });
      },

      renderInit: function () {
        $("#content-view").html(tpl);
        var curr = new Date;
        var first = curr.getDate() - curr.getDay() + 1;
        var last = first + 6;

        var firstday = new Date(curr.setDate(first)).toISOString().slice(0, 10);
        var lastday = new Date((new Date).setDate(last)).toISOString().slice(0, 10);

        this.projects = new Projects();
        var that = this;
        this.projects.fetch({
          success: function (collection, response) {
            var template = _.template($("script#tpl-form").html());
            $("#calc-form").html(template({
              "start": firstday,
              "end": lastday,
              "projects": collection.models
            }));
          },
          error: function (collection, response) {
            // console.log(router);
            
            // alert(response.status + " " + response.statusText);
          }
        });
      },

      renderComponents: function () {
        this.active = 'components';
        var template = _.template($("script#tpl-tabs").html());
        $("#calc-content").html(template({
          "active": 'components'
        }));

        if (!this.calc || !this.issues) {
          window.location.replace('./#calc/main');
          return;
        }

        var project = $("#project").val();
        if (!project) {
          alert('Please select project!');
          window.location.replace('./#calc/main');
          return;
        }
        this.renderComponentsData();
      },

      renderMain: function () {
        this.active = 'main';
        var template = _.template($("script#tpl-tabs").html());
        $("#calc-content").html(template({
          "active": 'main'
        }));

        if (!this.calc) {
          this.loadAllData();
          return;
        }

        this.renderUsersData();
      },

      renderUser: function () {
        var filtered = this.calc.models.filter(x => x.get('userId') === this.params).map(x => {
          return {
            id: x.get('issueKey'),
            date: x.get('startDate').slice(0, 10),
            duration: x.get('duration')
          }
        });

        var template = _.template($("script#tpl-user").html());
        $("#calc-content").html(template({
          "data": filtered,
          "user": this.params
        }));
      },

      renderUsersData: function () {
        if (!this.calc) {
          return;
        }

        var start = $("#startdate").val();
        var end = $("#enddate").val();
        var data = loadData(this.calc.models, this.issues.models, start, end);
        var combined = combineData(this.calc.models, this.issues.models);


        var template = _.template($("script#tpl-calc").html());
        $("#tab-content").html(template({
          "labels": data.labels,
          "users": data.users,
          "total": data.total,
          "data": data
        }));
        $('.tree').treegrid({
          initialState: 'collapsed'
        });

        var combined = combineData(this.calc.models, this.issues.models);

        var template = _.template($("script#tpl-export").html());
        $("#calc-export").html(template({
          "data": combined
        }));
      },

      renderComponentsData: function () {
        if (!this.issues) {
          return;
        }
        var components = {};

        var ncData = loadComponentData(null, this.issues.models, this.calc.models);
        if (ncData.length > 0) {
          components[0] = {
            title: 'No component',
            data: ncData
          };
        }

        for (let i = 0; i < this.issues.length; i++) {
          var issue = this.issues.models[i];
          if (issue.get('components').length > 0) {
            if (components[issue.get('components')[0].id] === undefined) {
              components[issue.get('components')[0].id] = {
                title: issue.get('components')[0].name,
                data: loadComponentData(issue.get('components')[0].id, this.issues.models, this.calc.models)
              }
            }
          }
        }

        $("#tab-content").html('');

        var start = $("#startdate").val();
        var end = $("#enddate").val();
        var keys = Object.keys(components);
        for (let i = 0; i < keys.length; i++) {
          var cmp = components[keys[i]];

          var template = _.template($("script#tpl-cmp").html());
          $("#tab-content").append(template({
            "key": keys[i],
            "title": cmp.title
          }));

          var data = loadData(cmp.data, this.issues.models, start, end);
          var id = '#cmp-body-' + keys[i];
          var template = _.template($("script#tpl-calc").html());
          $(id).html(template({
            "labels": data.labels,
            "users": data.users,
            "total": data.total,
            "data": data
          }));
        }

        $('.tree').treegrid({
          initialState: 'collapsed'
        });
      },

      exportRawData: function () {
        var elt = document.getElementById('raw-data');
        var wb = XLSX.utils.table_to_book(elt, { sheet: "Sheet 1", raw: true });
        this.doExport(wb, 'raw_', '.csv');
      },

      exportData: function () {
        $('.tree').treegrid('expandAll');

        var wb = { SheetNames: [], Sheets: {} };
        var trees = $('.tree');

        for (let i = 0; i < trees.length; i++) {
          var table = trees[i];

          var id = table.id.replace("table-", "table-title-");
          var title = $('#' + id).text();
          title = title === '' ? 'Sheet ' + i : title;

          var elt = document.getElementById(table.id);
          var sheet = XLSX.utils.table_to_sheet(elt, { sheet: title, raw: true });
          sheet['!rows'] = [];

          var rows = $('#' + table.id + ' tbody').children('tr');
          for (let j = 0; j < rows.length; j++) {
            var row = rows[j];
            sheet['!rows'][j] = {
              hpt: $(row).data('tasks') * 20,
            };
          }
          XLSX.utils.book_append_sheet(wb, sheet, title);
        }
        this.doExport(wb, '');
        $('.tree').treegrid('collapseAll');
      },

      doExport: function (wb, prefix, ext) {
        var start = $("#startdate").val();
        var end = $("#enddate").val();
        var project = $("#project").val();
        project = project != '' ? project : 'All';

        ext = ext ? ext : '.xlsx';

        var name = prefix + this.active + '_' + project + '_' + start + '_' + end + ext;
        XLSX.writeFile(wb, name);
      }
    });

    return UserView;
  });
