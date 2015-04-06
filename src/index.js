/**
 * Created by kklimuk on 4/4/15.
 */
'use strict';
var Page = require('./page');
var Histogram = require('./histogram');
var Annotation = require('./annotation');

var cache = {};
window.onstatechange = function (pathname) {
    var page = new Page(pathname);

    function oncomplete() {
        if (!document.querySelector('.pull-request-histogram') &&
            document.querySelector('.table-list-header') && page.isPullRequests) {
            var histogram = new Histogram(page);
            var node = document.querySelector('.table-list-header');

            node.parentNode.insertBefore(histogram, node);
        } else {
            var assigneeButton = document.querySelector('.sidebar-assignee button.discussion-sidebar-toggle');
            assigneeButton.addEventListener('click', function () {
                new Annotation(page.graph);
            });

            assigneeButton.click();
            assigneeButton.click();
        }
    }

    if (page.isPullRequests || page.isSinglePullRequest) {
        if (Date.now() - (cache.lastModified || 0) > 60000) {
            page.fetchPullRequests().then(function () {
                cache.lastModified = Date.now();
                cache.graph = page.graph;
                oncomplete();
            }, function (error) {
                console.error(error.stack);
            });
        } else {
            page.graph = cache.graph;
            oncomplete();
        }
    }
};

window.onstatechange(window.location.pathname);