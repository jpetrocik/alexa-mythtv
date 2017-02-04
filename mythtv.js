var http = require('http');
const didYouMean = require('didyoumean2')

function MythTv() {
	var frontendIp = "192.168.1.11",
		frontendPort = "6547";


	function sendRequest(method, url, port, callback) {
		var options = {
			host: frontendIp,
			port: port,
			path: url,
			method: method,
			headers: {
				Accept: 'application/json',
			}
		};

		console.log(url);

		var req = http.request(options, function(response) {
			var body = '';
			response.on('data', function(d) {
				body += d;
			});
			response.on('end', function() {
				if (response.statusCode == 200) {
					var results = JSON.parse(body);
					callback(response.statusCode, results);
				} else {
					callback(response.statusCode);
				}
			});
		});
		req.end();

		return req;
	};

	this.stop = function(callback) {
		console.log("Stop Playback");
		sendRequest("POST", "/Frontend/SendAction?Action=STOPPLAYBACK", 6547, function(statusCode, results){
			callback(statusCode === 200);
		});
	};

	this.pause = function(callback) {
		console.log("Pausing Playback");
		sendRequest("POST", "/Frontend/SendAction?Action=PAUSE", 6547, function(statusCode, results){
			callback(statusCode === 200);
		});
	};

	this.resume = function(callback) {
		console.log("Resuming Playback");
		sendRequest("POST", "/Frontend/SendAction?Action=PLAY", 6547, function(statusCode, results){
		callback(statusCode === 200);
		});
	};

	this.start = function(show, callback) {
		console.log("Playing " + show);

		this.recordedListing(function(statusCode, showListings) {
			if (statusCode == 200) {
				var bestMatch = didYouMean(show.toLowerCase(), showListings.ProgramList.Programs, { matchPath: "Title"});
				console.log(bestMatch);

				if (bestMatch == null) {
					callback(false);
					return;
				}

				console.log("Starting " + bestMatch.Title);

				sendRequest("POST", "/Frontend/PlayRecording?ChanId=" + bestMatch.Channel.ChanId + "&StartTime=" + bestMatch.StartTime, 6547, 
					function(statusCode, results) {
						callback(statusCode === 200, bestMatch.Title);
					}
				);
			} else {
				callback(false);
			}
		});
	};

	this.recordedListing = function(callback) {
		console.log("Retrieving record shows");
		sendRequest("GET", "/Dvr/GetRecordedList?StartIndex=1&Count=100&Descending=true", 6544, callback);
	}

}

module.exports = MythTv;