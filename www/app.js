//
// Copyright 2015, Evothings AB
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

$(document).ready(function() {

	$('#connectButton').click(function() {
		app.connect()
	})

	$('#disconnectButton').click(function() {
		app.disconnect()
	})

	$('#led').click(function(){
		app.ledOn()
	})

	$('#led2').click(function(){
		app.ledWave()
	})
})

var app = {}

app.PORT = 80
app.socketId

app.connect = function() {

	var IPAddress = $('#IPAddress').val()

	console.log('Trying to connect to ' + IPAddress)

	$('#startView').hide()
	$('#connectingStatus').text('Connecting to ' + IPAddress)
	$('#connectingView').show()

	chrome.sockets.tcp.create(function(createInfo) {

		app.socketId = createInfo.socketId

		chrome.sockets.tcp.connect(
			app.socketId,
			IPAddress,
			app.PORT,
			connectedCallback)
	})

	function connectedCallback(result) {

		if (result === 0) {

			 console.log('Connected to ' + IPAddress)

			 $('#connectingView').hide()
			 $('#controlView').show()

		}
		else {

			var errorMessage = 'Failed to connect to ' + app.IPAdress
			console.log(errorMessage)
			navigator.notification.alert(errorMessage, function() {})
			$('#connectingView').hide()
			$('#startView').show()
		}
	}
}

app.sendString = function(sendString) {

	console.log('Trying to send:' + sendString)

    chrome.sockets.tcp.setPaused(app.socketId, false);

	chrome.sockets.tcp.send (
		app.socketId,
		app.stringToBuffer(sendString),
		function(sendInfo) {

			if (sendInfo.resultCode < 0) {

				var errorMessage = 'Failed to send data'

				console.log(errorMessage)
				navigator.notification.alert(errorMessage, function() {})
			}
		}
	)
    chrome.sockets.tcp.onReceiveError.addListener(function(info) {
        navigator.notification.alert(info, function() {})
    });
}

app.ledOn = function() {

    var requestString = "GET /rainbow HTTP/1.1\r\n";
        requestString +="Host: "+IPAddress+"\r\n";
        requestString += "fade=3000\r\n";
        requestString += "Connection: keep-alive\r\n\r\n";

	app.sendString(requestString)

	$('#led').removeClass('ledOff').addClass('ledOn')

	$('#led').unbind('click').click(function(){
		app.ledOff()
	})
}

app.ledWave = function() {

    var requestString = "GET /wave HTTP/1.1\r\n";
        requestString += "Host: "+IPAddress+"\r\n";
        requestString += "r=255&g=32&b=10&fade=5000\r\n";
        requestString += "Connection: keep-alive\r\n\r\n";

	app.sendString(requestString)

	$('#led2').removeClass('ledOff').addClass('ledOn')

	$('#led2').unbind('click').click(function(){
		app.ledOff()
	})
}

app.ledOff = function() {

    var requestString = "GET /ledsoff HTTP/1.1\r\n";
        requestString += "Host: "+IPAddress+"\r\n";
        requestString += "fade=500\r\n";
        requestString += "Connection: close\r\n\r\n";

	app.sendString(requestString)

	$('#led').removeClass('ledOn').addClass('ledOff')
	$('#led2').removeClass('ledOn').addClass('ledOff')

	$('#led').unbind('click').click(function(){
		app.ledOn()
	})
	$('#led2').unbind('click').click(function(){
		app.ledWave()
	})
}

app.disconnect = function() {

	chrome.sockets.tcp.close(app.socketId, function() {
		console.log('TCP Socket close finished.')
	})

	$('#controlView').hide()
	$('#startView').show()
}

// Helper functions.

app.stringToBuffer = function(string) {

	var buffer = new ArrayBuffer(string.length)
	var bufferView = new Uint8Array(buffer)

	for (var i = 0; i < string.length; ++i) {

		bufferView[i] = string.charCodeAt(i)
	}

	return buffer
}

app.bufferToString = function(buffer) {

	return String.fromCharCode.apply(null, new Uint8Array(buffer))
}
