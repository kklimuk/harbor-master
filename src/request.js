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