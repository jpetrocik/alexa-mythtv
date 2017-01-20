var http = require('http');

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

		return http.request(options, function(response) {
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

	this.savePosition = function() {

	};

	this.start = function(show, callback) {
		console.log("Playing " + show);

		this.recordedListing(function(statusCode, results) {

			if (statusCode == 200) {

				var foundMatch = results.ProgramList.Programs.some(function(program, index){
					if ( program.Title.toLowerCase() === show.toLowerCase()) {
						console.log("Starting " + program.Title);
						sendRequest("POST", "/Frontend/PlayRecording?ChanId=" + program.Channel.ChanId + "&StartTime=" + program.StartTime, 6547, 
							function(statusCode, results) {
								callback(statusCode === 200);
							}
						);
						return true;
					}
				});

				//no match found
				if (!foundMatch)
					callback(false);

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