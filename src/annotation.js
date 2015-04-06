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