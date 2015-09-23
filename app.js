'use strict';

var request = require('request'),
	_ = require('underscore'),
	http = require('http'),
	util = require('util'),
	url = require('url'),
	qs = require('querystring'),
	fs = require('fs');

function getImage(res, url_parts) {
	res.end('Image url is  ' + url_parts.query.img_url);
}

function onRequest(req, res) {
	var url_parts = url.parse(req.url, true);

	var body = '';
	if (req.method === 'POST') {
		req.on('data', function(data) {
			body += data;
		});
		req.on('end', function() {
			var POST = qs.parse(body);
			res.end('Image url is ' + POST.img_url);
		});
	} else { // GET method case
		if(url_parts.pathname == '/')
			fs.readFile('./view/form.html', function(err, data) {
				res.end(data);
			});
		else if(req.method === 'POST' && url_parts.pathname == '/getImage') {
			getImage(res, url_parts);
		}
	}
}

http.createServer(onRequest).listen(3000);
