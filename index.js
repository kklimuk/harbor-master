(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by kklimuk on 4/5/15.
 */
'use strict';

function Annotation(graph) {
    var menus = document.querySelectorAll('[data-filterable-for=assignee-filter-field] .select-menu-item');
    Array.prototype.forEach.call(menus, function(el) {
        var login = el.querySelector('[name="issue[assignee]"]').value;

        var iconElement = el.querySelector('.select-menu-item-icon');
        iconElement.style.width = '32px';
        iconElement.style.padding = '8px 0 8px 6px';

        if (graph.people[login] && graph.people[login].assigned.length) {
            iconElement.classList.remove('octicon-check');
            iconElement.classList.add('octicon-git-pull-request');
            iconElement.classList.add('open');
            iconElement.textContent = ' ' + graph.people[login].assigned.length;
        }
    });
}

module.exports = Annotation;
},{}],2:[function(require,module,exports){
var colors = ["#abcdef", "#31859c", "#5a6986", "#4886FC", "#0579aa", "#db5855", "#eedd66", "#358a5b", "#00cafe", "#98BAD6", "#1957b0", "#89e051", "#3994bc", "#3a4040", "#946d57", "#7070ff", "#46390b", "#0095d9", "#ae17ff", "#6e4a7e", "#1E90FF", "#467C91", "#fcd46d", "#f7ede0", "#dc566d", "#438eff", "#ed2cd6", "#fcaf3e", "#c7a938", "#ff0c5a", "#82937f", "#701516", "#b0ce4e", "#ca2afe", "#343761", "#8a0707", "#375eab", "#945db7", "#4F5D95", "#aaaaff", "#FFCB1F", "#e4cc98", "#b07219", "#7dd3b0", "#ed2cd6", "#0298c3", "#60B5CC", "#fa1fa1", "#848bf3", "#636746", "#f7941e", "#91de79", "#341708", "#ee0000", "#7891b1", "#0098db", "#3d9970", "#244776", "#e44b23", "#a54c4d", "#ffac45", "#555", "#6594b9", "#fdcd00", "#d4bec1", "#36699B", "#db5855", "#dea584", "#74283c", "#f69e1d", "#9DC3FF", "#0e60e3", "#e4cc98", "#cd6400", "#fcd7de", "#2584c3", "#8a1267", "#543978", "#bd79d1", "#2b446d", "#e3592c", "#1ac620", "#02f88c", "#c9df40", "#004200", "#77d9fb", "#5a63a3", "#6a40fd", "#6E4C13", "#f0a9f0", "#45f715", "#ee7d06", "#2779ab", "#33CCFF", "#ff2b2b", "#178600", "#563d7c", "#499886", "#44a51c", "#066ab2", "#cc9900", "#b0b77e", "#f97732", "#f64e3e", "#3D6117", "#0d3c6e", "#f5c800", "#755223", "#f6a51f", "#0298c3", "#7b9db4", "#3be133", "#7582D1", "#b0ce4e", "#b845fc", "#cc5555", "#e3491a", "#ff9c2e", "#dbded5", "#118f9e", "#596706", "#075ff1", "#078193", "#d80074", "#c065db", "#f1e05a", "#199c4b", "#bb92ac", "#007eff", "#198ce7", "#0faf8d", "#cc0000", "#652B81", "#3994bc", "#1e4aec", "#dbb284", "#3581ba", "#ce279c", "#3fb68b", "#A8FF97", "#2700e2", "#cabbff", "#37775b", "#0d8921", "#8dc63f", "#e69f56", "#3ebc27", "#ccce35", "#f3ca0a", "#ff0000", "#8ad353", "#0298c3", "#6600cc", "#4d41b1", "#3a81ad", "#cc5c24", "#B9D9FF", "#ff8877", "#bcdc53", "#a270ba", "#29b544", "#a9188d", "#cc0088", "#f34b7d", "#120F14", "#cca760", "#ffce3b"];
var position = 0;
Object.defineProperties(colors, {
    'get': {
        value: function () {
            return colors[position++];
        }
    },
    'reset': {
        value: function () {
            position = 0;
            return colors;
        }
    }
});

module.exports = colors;
},{}],3:[function(require,module,exports){
/**
 * Created by kklimuk on 4/5/15.
 */

module.exports = {
    TOKEN: window.HARBOR_MASTER_TOKEN
};
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
/**
 * Created by kklimuk on 4/5/15.
 */
'use strict';
var colors = require('./colors');

function Histogram(page) {
    colors.reset();

    var graph = page.graphWithFilters();
    this.people = Object.keys(graph.people).map(function (id) {
        return graph.people[id];
    }).filter(function (person) {
        return person.assigned.length > 0;
    }).sort(function (a, b) {
        return a.assigned.length < b.assigned.length ? 1 : -1;
    });
    this.totalAssigned = this.people.reduce(function (memo, person) {
        return memo + person.assigned.length;
    }, 0);
    this.totalPullRequests = Object.keys(graph.pullRequests).length;
    this.url = '/' + page.owner + '/' + page.repository + '/pulls';

    this.container = this.createContainer();
    this.container.appendChild(this.createDescription());
    this.container.appendChild(this.createHistogramContainer());

    return this.container;
}

Histogram.prototype.createContainer = function () {
    var container = document.createElement('div');
    container.className = 'issues-reset-query-wrapper';
    this.setStyle(container, this.containerStyle);
    return container;
};

Histogram.prototype.createDescription = function () {
    var description = document.createElement('span');
    description.textContent = 'Assignees:';
    this.setStyle(description, this.descriptionStyle);
    return description;
};

Histogram.prototype.createHistogramContainer = function () {
    var container = document.createElement('div');

    this.setStyle(container, this.histogramStyle);
    container.className = 'pull-request-histogram';
    this.people.forEach(function (person) {
        container.appendChild(this.createPersonBar(person));
    }, this);
    if (this.totalPullRequests - this.totalAssigned > 0) {
        container.appendChild(this.createUnassignedBar());
    }

    return container;
};

Histogram.prototype.createPersonBar = function (person) {
    var container = document.createElement('a');
    container.href = this.url + '/assigned/' + person.login;
    container.className = 'pull-request-person tooltipped tooltipped-n';
    container.setAttribute('aria-label',
        person.login + ': ' + person.assigned.length + ' pull request' + (person.assigned.length > 1 ? 's' : ''));
    this.setStyle(container, this.personBarStyle(person));

    var percentage = person.assigned.length / this.totalPullRequests * 100;
    if (percentage > 3) {
        var image = document.createElement('img');
        image.src = person.avatarURL;
        image.alt = person.login;
        container.appendChild(image);
        this.setStyle(image, this.avatarImageStyle);
    }

    return container;
};

Histogram.prototype.createUnassignedBar = function () {
    var container = document.createElement('a');
    container.href = this.url + (window.location.search ? window.location.search :  '?q=is%3Aopen+is%3Apr') + '+no%3Aassignee';
    container.className = 'pull-request-unassigned tooltipped tooltipped-n';
    var unassigned = (this.totalPullRequests - this.totalAssigned);
    container.setAttribute('aria-label',
        unassigned + ' unassigned pull request' + (unassigned > 1 ? 's' : ''))
    this.setStyle(container, this.unassignedBarStyle());

    return container;
};

Histogram.prototype.setStyle = function (el, styles) {
    Object.keys(styles).forEach(function (style) {
        var components = style.split('-');
        var first = components.shift();

        components = components.map(function (component) {
            return component.substring(0, 1).toUpperCase() + component.substring(1);
        });
        components.unshift(first);

        el.style[components.join('')] = styles[style];
    });
};

var height = 40;
Histogram.prototype.histogramStyle = {
    'border-radius': '3px',
    'height': height + 'px',
    'background-color': '#F8F8F8',
    'border': '1px solid #E5E5E5',
    display: 'flex',
    'align-content': 'stretch',
    'align-items': 'stretch',
    flex: '1'
};

Histogram.prototype.descriptionStyle = {
    'padding-right': '10px',
    'font-weight': 'bold'
};

Histogram.prototype.containerStyle = {
    'display': 'flex',
    'align-items': 'center'
};

Histogram.prototype.avatarImageStyle = {
    width: '30px',
    height: '30px',
    margin: '4px',
    display: 'block',
    border: '1px solid #E5E5E5'
};

Histogram.prototype.personBarStyle = function (person) {
    return {
        flex: Math.round(person.assigned.length / this.totalPullRequests * 100),
        float: 'left',
        'background-color': colors.get(),
        display: 'block'
    };
};

Histogram.prototype.unassignedBarStyle = function () {
    return {
        'min-width': ((this.totalPullRequests - this.totalAssigned) / this.totalPullRequests * 100).toFixed(2) + '%',
        display: 'block'
    };
};


module.exports = Histogram;
},{"./colors":2}],6:[function(require,module,exports){
/**
 * Created by kklimuk on 4/4/15.
 */
'use strict';
var Page = require('./page');
var Histogram = require('./histogram');
var Annotation = require('./annotation');

var cache = {};
window.onstatechange = function (pathname) {
    var page = new Page(pathname, window.location.search);

    function oncomplete() {
        if (!document.querySelector('.pull-request-histogram') &&
            document.querySelector('.table-list-header') && page.isPullRequests) {
            var histogram = new Histogram(page);
            var node = document.querySelector('.table-list-header');

            node.parentNode.insertBefore(histogram, node);
        } else if (page.isSinglePullRequest) {
            var assigneeButton = document.querySelector('.sidebar-assignee button.discussion-sidebar-toggle');
            assigneeButton.addEventListener('click', function () {
                new Annotation(page.graph);
            });

            assigneeButton.click();
            assigneeButton.click();
        }
    }

    if (page.isPullRequests || page.isSinglePullRequest) {
        console.log(page.apiURL, cache);
        if (Date.now() - (cache.lastModified || 0) > 60000 || !(page.apiURL in cache)) {
            page.fetchPullRequests().then(function () {
                cache.lastModified = Date.now();
                cache[page.apiURL] = page;
                console.log(page.graph);
                oncomplete();
            }, function (error) {
                console.error(error.stack);
            });
        } else {
            console.log(cache[page.apiURL].graph);
            page.graph = cache[page.apiURL].graph;
            oncomplete();
        }
    }
};

window.onstatechange(window.location.pathname);
},{"./annotation":1,"./histogram":5,"./page":7}],7:[function(require,module,exports){
/**
 * Created by kklimuk on 4/5/15.
 */
'use strict';
var request = require('./request');
var config = require('./config');
var Graph = require('./graph');

function Page(pathname, queryString) {
    this.graph = new Graph();
    this.filters = this.parseFilters(queryString);
    this.setType(pathname);
}

Page.prototype.graphWithFilters = function () {
    return this.graph.withFilters(this.filters);
};

Page.prototype.setType = function (pathname) {
    var components = pathname.substring(1).split('/');
    var previousComponent = null;
    while (components.length) {
        var component = components.pop();
        if (component === 'assigned') {
            this.filters.assignee = new Set([previousComponent]);
            continue;
        }

        this.isPullRequests = component === 'pulls';
        if (previousComponent !== null && !this.filters.assignee) {
            this.filters.author = new Set([previousComponent]);
        }

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
};

Page.prototype.parseFilters = function (queryString) {
    var query = queryString.match(/q=(.*?)(?:&|$)/);
    query = query && query.length > 1 ? query[1] : '';

    return decodeURIComponent(query)
        .replace(/(".*?)\+(.*?")/g, '$1 $2')
        .split('+')
        .map(function (pair) {
            pair = pair.split(':');
            return [pair.shift(), pair.join(':').replace(/"/g, '')];
        })
        .reduce(function (memo, pair) {
            var key = pair[0],
                value = pair[1];

            if (key === '' || value === '') {
                return memo;
            }

            if (!(key in memo)) {
                memo[key] = new Set();
            }
            memo[key].add(value);
            return memo;
        }, {});
};

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
},{"./config":3,"./graph":4,"./request":8}],8:[function(require,module,exports){
/**
 * Created by kklimuk on 4/4/15.
 */
'use strict';

function Response(request) {
    this.status = request.status;
    this.body = request.responseText;
    this.headers = this.convertHeaders(request.getAllResponseHeaders());

    if (this.headers['Content-Type'].indexOf('application/json') !== -1) {
        this.json = JSON.parse(this.body);
    }
}

Response.prototype.convertHeaders = function (headers) {
    var result = {};

    var parts = headers.trim().split('\n').map(function (header) {
        var trimmedHeader = header.trim();
        var position = trimmedHeader.indexOf(':');

        return [
            trimmedHeader.substring(0, position).trim(),
            trimmedHeader.substring(position + 1).trim()
        ];
    });
    for (var i = 0, length = parts.length; i < length; i++) {
        result[parts[i][0]] = parts[i][1];
    }

    return result;
};

function request(url, options) {
    if (!options) {
        options = {};
    }

    return new Promise(function requestResolver(resolve, reject) {
        var request = new XMLHttpRequest();

        if (options.query) {
            url += '?';
            Object.keys(options.query).forEach(function (param, index, array) {
                url += param + '=' + options.query[param];
                if (index < array.length - 1) {
                    url += '&';
                }
            });
        }

        request.open((options.method || 'get').toUpperCase(), url, true);

        if (options.headers) {
            Object.keys(options.headers).forEach(function (header) {
                request.setRequestHeader(header, options.headers[header]);
            });
        }

        request.onload = function () {
            resolve(new Response(request));
        };

        request.onerror = reject;

        request.send();
    });

}

module.exports = request;
},{}]},{},[6]);
