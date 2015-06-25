var http = require('http');
var url = require('url');
var querystring = require('querystring');
var osmtogeojson = require('osmtogeojson');

var server = http.createServer(function(req, res) {
    var params = querystring.parse(url.parse(req.url).query);
    var ags = params['ags'];
    var postdata = "[timeout:6000];rel[\"de:amtlicher_gemeindeschluessel\"=\"" + ags + "\"];(._;>;);out;";
	
	var options = {
  		hostname: 'overpass-api.de',
		path: '/api/interpreter',
		method: 'POST',
		headers: {
    		'Content-Type': 'application/x-www-form-urlencoded',
		    'Content-Length': postdata.length
		  }
	};
    
    var data='';

	var request = http.request(options, function(response) {
    	response.on('data', function (chunk) {
        	data += chunk;
	    });
    	response.on('end',function() {
			console.log(data);
			res.writeHead(200, {"Content-Type": "application/json"});
			
			var DOMParser = require('xmldom').DOMParser;
			var xml = new DOMParser().parseFromString(data,"text/xml");
			
			var geojson = osmtogeojson(xml);
			console.log(geojson);
			
			res.end(JSON.stringify(geojson));
    	});
	});

	request.on('error', function(e) {
  		console.log('problem with request: ' + e.message);
	});

	request.write(postdata);
	request.end();
});
server.listen(process.env.PORT||8080);