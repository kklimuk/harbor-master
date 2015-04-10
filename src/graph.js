/**
 * Created by kklimuk on 4/5/15.
 */
'use strict';

function Graph(people, pullRequests) {
    this.people = people || {};
    this.pullRequests = pullRequests || {};
}

Graph.prototype.withFilters = function (filters) {
    if (Object.keys(filters).length === 0) {
        return this;
    }

    var pullRequests = Object.keys(this.pullRequests).map(function (id) {
        return this.pullRequests[id];
    }, this);
    var people = Object.keys(this.people).map(function (login) {
        return this.people[login];
    }, this);
    var pair = null;

    if (filters.assignee) {
        pair = this.filter(pullRequests, people, function (pullRequest) {
            return filters.assignee.has((pullRequest.assignee || {}).login);
        });
        people = pair[0];
        pullRequests = pair[1];
    }

    if (filters.author) {
        pair = this.filter(pullRequests, people, function (pullRequest) {
            return filters.author.has(pullRequest.assigner.login);
        });
        people = pair[0];
        pullRequests = pair[1];
    }

    if (filters.label) {
        pair = this.filter(pullRequests, people, function (pullRequest) {
            for (var i = 0, length = pullRequest.labels.length; i < length; i++) {
                if (filters.label.has(pullRequest.labels[i])) {
                    return true;
                }
            }
            return false;
        });
        people = pair[0];
        pullRequests = pair[1];
    }

    return new Graph(people.reduce(function (memo, person) {
        memo[person.login] = person;
        return memo;
    }, {}), pullRequests.reduce(function (memo, pullRequest) {
        memo[pullRequest.number] = pullRequest;
        return memo;
    }, {}));
};

Graph.prototype.filter = function (pullRequests, people, func) {
    pullRequests = pullRequests.filter(func);

    var requestSet = new Set(pullRequests);
    people = people.map(function (person) {
        person = person.copy();
        person.assigned = person.assigned.filter(function (pullRequest) {
            return requestSet.has(pullRequest);
        });

        person.assigner = person.assigner.filter(function (pullRequest) {
            return requestSet.has(pullRequest);
        });
        return person;
    });

    return [people, pullRequests];
};

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
    this.labels = (data.labels || []).map(function (label) {
        return label.name;
    });
    graph.pullRequests[data.number] = this;
}

function Person(data, isAssigner, pullRequest, graph) {
    if (typeof isAssigner === 'undefined') {
        Object.keys(data).forEach(function (key) {
            this[key] = data[key];
        }, this);
        return this;
    }

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

Person.prototype.copy = function () {
    return new Person({
        id: this.id,
        login: this.login,
        avatarURL: this.avatarURL,
        assigned: this.assigned,
        assigner: this.assigner
    });
};

module.exports = Graph;