/**
 * Created by kklimuk on 4/5/15.
 */
'use strict';

function Graph() {
    this.people = {};
    this.pullRequests = {};
}

Graph.prototype.addPullRequest = function (data) {
    return new PullRequest(data, this);
};

function PullRequest(data, graph) {
    if (data.number in graph.pullRequests) {
        return graph.pullRequests[data.number];
    }

    this.title = data.title;
    this.number = data.number;
    this.assignee = data.assignee ? new Person(data.assignee, false, this, graph) : null;
    this.assigner = data.user ? new Person(data.user, true, this, graph) : null;
    this.updatedAt = new Date(data.date);
    graph.pullRequests[data.number] = this;
}

function Person(data, isAssigner, pullRequest, graph) {
    if (data.login in graph.people) {
        var person = graph.people[data.login];
        if (isAssigner) {
            person.assigner.push(pullRequest);
        } else {
            person.assigned.push(pullRequest);
        }
        return person;
    }

    this.id = data.id;
    this.login = data.login;
    this.avatarURL = data.avatar_url;
    this.assigned = isAssigner ? [] : [ pullRequest ];
    this.assigner = isAssigner ? [ pullRequest ] : [];
    graph.people[this.login] = this;
}

module.exports = Graph;