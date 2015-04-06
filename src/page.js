/**
 * Created by kklimuk on 4/5/15.
 */
'use strict';
var request = require('./request');
var config = require('./config');
var Graph = require('./graph');

function Page(pathname) {
    this.graph = new Graph();
    var components = pathname.substring(1).split('/');
    var previousComponent = null;
    while (components.length) {
        var component = components.pop();

        this.isPullRequests = component === 'pulls';
        this.isSinglePullRequest = component === 'pull';
        if (this.isPullRequests || this.isSinglePullRequest) {
            if (this.isSinglePullRequest) {
                this.pullRequestId = previousComponent;
            }

            this.repository = components.pop();
            this.owner = components.pop();
            this.apiURL = window.location.protocol + '//api.github.com/repos/' + this.owner + '/' + this.repository;

            break;
        }

        previousComponent = component;
    }
}

Page.prototype.fetchPullRequests = function () {
    var headers = {
        'Authorization': 'token ' + config.TOKEN
    };
    var self = this;

    return request(self.apiURL + '/issues', {
        query: {
            state: 'open'
        },
        headers: headers
    }).then(function (response) {
        var last = (response.headers.Link || '').match(/page=(\d+)>; rel="last"$/);
        last = last && last.length > 1 ? last[1] : 0;

        if (last) {
            var promises = [response];
            for (var i = 1; i < last; i++) {
                promises.push(request(self.apiURL + '/pulls', {
                    query: {
                        state: 'open',
                        page: i + 1,
                        labels: 'Review Requested'
                    },
                    headers: headers
                }))
            }
            return Promise.all(promises);
        }
        return [response];
    }).then(function (responses) {
        return responses.reduce(function (memo, response) {
            return memo.concat(response.json);
        }, []).map(self.graph.addPullRequest, self.graph);
    });
};

module.exports = Page;