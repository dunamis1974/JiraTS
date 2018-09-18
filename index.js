import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import parseurl from 'parseurl';
import WorkLogs from './src/worklogs';
import conf from './conf';

let wl = new WorkLogs(conf.JIRA);
let allData = [];
const app = express();
const router = express.Router();

app.use(require('morgan')('tiny'));

var sess = {
  resave: true,
  saveUninitialized: true,
  secret: conf.COOKIE_KEY,
  cookie: {}
}

if (conf.ENV === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(conf.STATIC_ROUTE, express.static(conf.STATIC_PATH));

app.use(function (req, res, next) {
  if (req.session.logged) {
    conf.JIRA.basic_auth = {
      username: req.session.user,
      password: req.session.pass
    }
    wl = new WorkLogs(conf.JIRA);
  } else {
    const pathname = parseurl(req).pathname;
    console.log(pathname);
    if (pathname !== '/api/logout' && pathname !== '/api/login' && pathname.includes('/api')) {
      res.status(401);
      res.json({ success: false, code: 401 });
      return;
    }
  }
  next();
});

router.get('/', function (req, res) {
  res.json({ message: 'Hooray! Welcome to our api!' });
});

router.post('/login', async function (req, res) {
  if (!req.body.user || !req.body.pass) {
    res.json({ success: false });
    return;
  }
  conf.JIRA.basic_auth = {
    username: req.body.user,
    password: req.body.pass
  }
  wl = new WorkLogs(conf.JIRA);

  let me = wl.me()
    .then((data) => {
      req.session.user = req.body.user;
      req.session.pass = req.body.pass;
      req.session.me = req.body.data;
      req.session.logged = true;
      res.json({ success: true, user: data });
    })
    .catch((err) => {
      res.json({ success: false });
    });
});

router.get('/logout', async function (req, res) {
  req.session.destroy();
  res.json({ success: true });
});

router.post('/calc', async function (req, res) {
  wl.worklogList(req.body.start, req.body.end, req.body.project)
    .then((data) => {
      if (data.length === 1) {
        allData = data[0];
        res.json(wl.loadData(data[0], req.body.start, req.body.end));
      } else {
        res.json([]);
      }
    }).catch((err) => {
      res.json(err);
    });
});

router.get('/calc', async function (req, res) {
  if (req.query.start === undefined || req.query.end === undefined) {
    res.json([]);
    return;
  }
  wl.worklogList(req.query.start, req.query.end, req.query.project)
    .then((data) => {
      if (data.length === 1) {
        res.json(data[0]);
      } else {
        res.json([]);
      }
    }).catch((err) => {
      res.json(err);
    });
});

router.get('/issues', async function (req, res) {
  if (req.query.ids === undefined) {
    res.json([]);
    return;
  }

  let _issues = await wl.search(`id in (${req.query.ids})`);
  let issues = [];
  let epics = {};

  try {
    for (let i = 0; i < _issues.total; i++) {
      const data = _issues.issues[i];
      if (data !== undefined) {
        var epic = data.fields.customfield_10000;
        if (epic) {
          if (epics[epic] === undefined) {
            let _epic = await wl.search(`id=${epic}`);
            epics[epic] = _epic.issues[0].fields;
          }
          if (epics[epic] !== undefined) {
            epic = epics[epic].summary + ' (' + epic + ')';
          }
        }
        issues.push({
          id: data.key,
          title: data.fields.summary,
          components: data.fields.components,
          epic: epic
        });
      }
    }
  } catch (error) {
    console.log(error);
  }

  res.json(issues);
});

router.get('/projects', function (req, res) {
  wl.projectsList()
    .then((data) => {
      res.json(data);
    }).catch((err) => {
      res.json(err);
    });
});

app.use('/api', router);

app.listen(conf.SERVER_PORT);
