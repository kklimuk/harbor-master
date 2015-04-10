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