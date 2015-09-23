'use strict';

var _ = require('underscore'),
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
		if(url_parts.pathname == '/getImage') {
			req.on('data', function(data) {
				body += data;
			});
			req.on('end', function() {
				var POST = qs.parse(body);
				var file_name = POST.img_url.split("/").pop();

				var request = http.get(POST.img_url, function(get_res) {
					var imageData = '';
					get_res.setEncoding('binary');

					get_res.on('data', function(chunk) {
						imageData += chunk;
					});
					get_res.on('end', function() {
						var img_save_path = './img_cache/' + file_name;
						fs.writeFile(img_save_path, imageData, 'binary', function(err) {
							if(err) throw err;
							
							console.log('File saved');

							var post_data = qs.stringify({
								'image_path' : img_save_path						
							});

							// var img = fs.readFileSync(img_save_path);

							var post_options = {
								host: 'localhost',
								port: '3000',
								path: '/showImage',
								method: 'POST'
							};

							var post_req = http.request(post_options, function(post_res) {
								post_res.setEncoding('utf8');
								var returned_data = '';
								post_res.on('data', function(chunk) {
									returned_data += chunk;
								});
								post_res.on('end', function() {
									// Need to redirect to root. 

									// var img = fs.readFileSync(returned_data);
									// res.writeHead(200, {'content-type':'image/gif'});
									// res.end(img, 'binary');

									fs.readFile(returned_data, function(err, content) {
										if (err) {
											res.writeHead(400, {'content-type': 'text/html'});
											console.log(err);
											res.end("No such image");
										} else {
											res.writeHead(200, {'content-type':'image/gif'});
											res.end(content, 'binary');
										}
									});
								});
							});

							// post_req.writeHead(200, {'Content-type' : 'image/gif'});
							// post_req.end(img, 'binary');
							post_req.write(post_data);
							post_req.end();
						});
					});
				});
				
				// res.end('Image url is ' + POST.img_url);
			});	
		}
		else if(url_parts.pathname == '/showImage') {
			console.log("You are now in Image showing Page. ");
			// res.writeHead(200, {"Content-type": "text/html"});
			// res.write("<img src='" + req.data.image_path + "' />");
			var body = '';
			req.on('data', function(data) {
				body += data;
			});
			req.on('end', function() {
				var POST = qs.parse(body);
				res.writeHead(200, {'content-type': 'text/plain'});
				res.write(POST.image_path);
				res.end();

				// res.write("<img src = '" + __dirname + POST.image_path.substring(1) + "' />");
				// fs.readFile(__dirname + POST.image_path.substring(1), function(err, content) {
				// 	if (err) {
				// 		res.writeHead(400, {'content-type': 'text/html'});
				// 		console.log(err);
				// 		res.end("No such image");
				// 	} else {
				// 		res.writeHead(200, {'content-type':'image/gif'});
				// 		res.end(content);
				// 	}
				// });
			});			
		}
		
	} else { // GET method case
		if(url_parts.pathname == '/')
			fs.readFile('./view/form.html', function(err, data) {
				res.end(data);
			});
		else if(url_parts.pathname == '/getImage') {
			getImage(res, url_parts);
		}
	}
}

http.createServer(onRequest).listen(3000);
