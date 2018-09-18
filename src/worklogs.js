import moment from 'moment';
import JiraClient from 'jira-connector';
import url from 'url';

class WorkLogs {
    constructor(options) {
        this.jira = new JiraClient(options);
        this.group = options.group;
        this.fields = options.fields;
    }

    async me() {
        return this.jira.myself.getMyself();
    }

    async search(jql) {
        return this.jira.search.search({ jql: jql, fields: this.fields, maxResults: 5000 });
    }

    async worklogList(start, end, project, callback) {
        var options = {
            uri: this.buildURL('/find/worklogs'),
            method: 'GET',
            json: true,
            followAllRedirects: true,
            qs: {
                startDate: start,
                endDate: end,
                project: project,
                group: this.group
            }
        };
        return this.jira.makeRequest(options, callback)
    }

    async issueData(issueKey, callback) {
        return this.jira.issue.getIssue({
            issueKey: issueKey,
            fields: this.fields
        }, callback);
    }

    async projectsList(options, callback) {
        return this.jira.project.getAllProjects(options, callback);
    }

    buildURL(path) {
        var apiBasePath = this.jira.path_prefix + 'rest/jira-worklog-query/';
        var version = 1;
        var requestUrl = url.format({
            protocol: this.jira.protocol,
            hostname: this.jira.host,
            port: this.jira.port,
            pathname: apiBasePath + version + path
        });

        return decodeURIComponent(requestUrl);
    }

    loadData(data, dateStart, dateEnd) {
        let start = moment(dateStart);
        let end = moment(dateEnd).add(1, 'day');
        let date = start;
        let res = {
            labels: []
        };
        let users = [];
        for (let i = 0; i < data.length; i++) {
            if (res[data[i].userId] === undefined) {
                res[data[i].userId] = [];
                users.push(data[i].userId);
            }
        }

        res.users = users;
        let total = 0;
        do {
            res.labels.push(date.format('MMM DD'));
            for (let j = 0; j < users.length; j++) {
                const user = users[j];
                let time = data.filter((x) => x.userId === user && date.isSame(x.startDate, 'day')).reduce((sum, o) => {
                    return sum + o.duration;
                }, 0);
                total += (time / 60 / 60);
                res[user].push(time / 60 / 60);
            }
            date = date.add(1, 'day');
        } while (date.isBefore(end, "day"));

        res.total = total;
        return res;
    }
}

export default WorkLogs;
