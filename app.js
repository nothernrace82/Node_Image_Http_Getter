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
			var file_name = POST.img_url.split("/").pop();

			var request = http.get(POST.img_url, function(res) {
				var imageData = '';
				res.setEncoding('binary');

				res.on('data', function(chunk) {
					imageData += chunk;
				});
				res.on('end', function(chunk) {
					fs.writeFile('./img_cache/' + file_name, imageData, 'binary', function(err) {
						if(err) throw err;
						console.log('File saved');
					})
				});
			});
			
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
