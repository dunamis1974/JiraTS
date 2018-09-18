var API = "/api/";
var JIRA = 'https://jira.credissimo.net/browse/';

var _USER = null;
var _TOKEN = null;
var _TREE = 0;

function setupAjax() {
  $.ajaxSetup({
    headers: {
      'Authorization': 'TOKEN ' + _TOKEN,
    }
  });

  $body = $("body");
  $(document).ajaxStart(function () {
    $body.addClass("loader");
  });
  $(document).ajaxStop(function () {
    $body.removeClass("loader");
  });
  $(document).ajaxError(function (e, request, settings) {
    $body.removeClass("loader");
    checkForError(request.responseJSON);
  });
}

function checkForError(result) {
  if (result == undefined) {
    return {
      isError: false,
      message: ''
    }
  } else if (result && result.success != null && result.success == false) {
    if (result.code != undefined && result.code == 401) {
      router.navigate('', true);
    }
    return {
      isError: true,
      errorMessage: result.message,
      code: result.code
    };
  }
  return {
    isError: false,
    message: result.message
  };
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}

function loadData(data, issues, dateStart, dateEnd) {
  let start = moment(dateStart);
  let end = moment(dateEnd).add(1, 'day');
  let date = start;
  let res = {
    labels: []
  };
  let users = [];
  for (let i = 0; i < data.length; i++) {
    if (res[data[i].get('userId')] === undefined) {
      res[data[i].get('userId')] = [];
      users.push(data[i].get('userId'));
    }
  }

  res.users = users;
  let total = 0;
  do {
    res.labels.push(date.format('MMM DD'));
    for (let j = 0; j < users.length; j++) {
      const user = users[j];

      let _filtered = data.filter((x) => x.get('userId') === user && date.isSame(x.get('startDate'), 'day'));
      filtered = _filtered.map((x) => {
        issue = issues.find((y) => y.get('id') === x.get('issueKey'))
        if (issue !== undefined) {
          x.set('title', issue.get('title'));
        } else {
          x.set('title', 'Missing');
        }
        return x;
      });

      let time = filtered.reduce((sum, o) => {
        return sum + o.get('duration');
      }, 0);
      total += (time / 60 / 60);
      res[user].push({
        time: (time / 60 / 60),
        tasks: filtered
      });
    }
    date = date.add(1, 'day');
  } while (date.isBefore(end, "day"));

  res.total = total;
  return res;
}

function loadComponentData(component, issues, data) {
  var res = [];
  for (let i = 0; i < issues.length; i++) {
    var issue = issues[i];
    if (!component) {
      if (issue.get('components').length === 0) {
        var wl = data.filter(x => x.get('issueKey') === issue.get('id'));
        res = res.concat(wl);
      }
    } else {
      if (issue.get('components').length > 0 && issue.get('components')[0].id === component) {
        var wl = data.filter(x => x.get('issueKey') === issue.get('id'));
        res = res.concat(wl);
      }
    }
  }

  return res;
}

function combineData(data, issues) {
  var combined = data.map((x) => {
    issue = issues.find((y) => y.get('id') === x.get('issueKey'))
    if (issue !== undefined) {
      x.set('title', issue.get('title'));
      x.set('epic', issue.get('epic'));
      x.set('component', ((issue.get('components').length > 0) ? issue.get('components')[0].name : null));
    } else {
      x.set('title', 'Missing');
    }
    return x;
  });

  return combined;
}

function calcTasksNumber(data) {
  var top = 1;
  for (let i = 0; i < data.length; i++) {
    var time = data[i].time;
    if (time > 0) {
      if (data[i].tasks.length > top) {
        top = data[i].tasks.length;
      }
    }
  }
  return top;
}