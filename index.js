var alexa = require('alexa-app');
var MythTv = require('./mythtv');

//module.change_code = 1;

var mythtv = new MythTv();
var mythtvApp = new alexa.app('mythtv');

mythtvApp.launch(function(request, response) {
	response.say("What would you like to watch, or you cna ask me what's on TV");
	response.shouldEndSession(false);
});

mythtvApp.error = function(e, request, response) {
	response.say("Sorry, " + e.message);
};

function handleResponse(status, response, successMessage, failedMessage){
	if (status)
		response.say(successMessage);
	else
		response.say(failedMessage);

	response.send();
}
 
mythtvApp.intent('play',
	{
	"slots":{"show":"LIST_OF_SHOWS"},
	"utterances":[ "play {show}" ]
	},
	function(request,response) {
		var show = request.slot('show');
		mythtv.start(show, function(status, matchedShow) {
			handleResponse(status, response, "Playing " + matchedShow, "Sorry I was unable to play " + show );
		});
		return false;
	}
);
 
mythtvApp.intent('pause',
	{
	"utterances":[ "pause" ]
	},
	function(request,response) {
		mythtv.pause(function(status) {
			handleResponse(status, response, "Paused", "Sorry I was unable to pause the show" );
		});
		return false;
	}
);

mythtvApp.intent('stop',
	{
	"utterances":[ "stop" ]
	},
	function(request,response) {
		mythtv.stop(function(status) {
			handleResponse(status, response, "Stopped", "Sorry I was unable to stop the show" );
		});
		return false;
	}
);

mythtvApp.intent('resume',
	{
	"utterances":[ "resume" ]
	},
	function(request,response) {
		mythtv.resume(function(status) {
			handleResponse(status, response, "Resumed", "Sorry I was unable to resume the show" );
		});
	}
);

mythtvApp.intent('listings',
	{
	"utterances":[ "{what's|what is} there to watch {tonight|}", "{what's|what is} on TV {tonight|}" ]
	},
	function(request,response) {
		mythtv.recordedListing(function(statusCode, results) {
			var listingResponse = "Here is what is on tonight. ";
			var total = 0;
			results.ProgramList.Programs.forEach(function(program, index){
				if (program.Category == "News" || total > 8) {
					return;
				}
				listingResponse += program.Title + ". "
				total++;
			});

			listingResponse += "What can I play for you?"

			response.shouldEndSession(false);
			handleResponse(statusCode == 200, response, listingResponse, "Sorry I was unable to find anything to watch" );
		});
		return false;
	}
);


mythtvApp.intent('AMAZON.StopIntent',
	{
	"utterances":[ "no words to discribe" ]
	},
	function(request,response) {
		response.say("");
	}
);

mythtvApp.intent('AMAZON.HelpIntent',
	{
	"utterances":[ "help" ]
	},
	function(request,response) {
		response.say("You may ask me to play something or I can tell you whats on TV tonight");
	}
);

module.exports = mythtvApp;
