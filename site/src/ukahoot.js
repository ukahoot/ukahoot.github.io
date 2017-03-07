(() => {
	"use strict";
	window.pid = null;
	window.tokenServer = "http://127.0.0.1:5556/";
	window.token = null;
	window.name = "ukahoot";
	window.clients = 1;
	window.wsURI = "wss://kahoot.it/cometd/";
	window.requestConfig = {
		method: 'GET',
		headers: new Headers(),
		cache: 'default'
	}
	window.clientsConnected = 0;
	window.isWaiting = false;
	
	var clients = [];
	var getKahootDate = () => {
		return (new Date).getTime();
	}
	var solveChallenge = challenge => {
		var lib = "var _ = {replace: function(){" +
				   "var args = arguments;" +
				   "var s = arguments[0];" + 
				   "return s.replace(args[1], args[2]);" +
				   "}};" +
				   "return ";
		var solver = new Function(lib + challenge);
		// return the solved token
		return solver().toString();
	}
	var getKahootToken = (headerToken, challengeToken) => {
		headerToken = atob(headerToken);
		challengeToken = solveChallenge(challengeToken);
		var token = "";
		for (var i = 0; i < headerToken.length; i++) {
		    var chr = headerToken.charCodeAt(i);
		    var mod = challengeToken.charCodeAt(i % challengeToken.length);
		    var dc = chr ^ mod;
		    token += String.fromCharCode(dc);
		}
		return token;
	}
	window.addEventListener('load', () => {
		var join     = document.getElementById('join');
		var pidBox   = document.getElementById('pid');
		var alertBox = document.getElementById('alert-box');
		var alertOk  = document.getElementById('alert-ok');
		var alertMsg = document.getElementById('alert-msg');
		var overlay  = document.getElementById('overlay');
		var loading  = document.getElementById('loading');
		var joinArea = document.getElementById('join-area');
		var start    = document.getElementById('start');
		var tooltip  = document.getElementById('help-tooltip');
		var tooltipArea = document.getElementById('tooltip-area');
		var joinButton = document.getElementById('join-game');
		var nameArea = document.getElementById('name-area');
		var clientCount = document.getElementById('client-count-area');
		var waitingArea = document.getElementById('waiting-area');
		var waitText = document.getElementById('wait');
		var loadingArea = document.getElementById('loading-area');

		window.showAlert = msg => {
			$(alertBox).fadeIn(200);
			$(overlay).fadeIn(300);
			alertMsg.textContent = msg;
			alertMsg.innerHTML = alertMsg.innerHTML.replace('\n', '<br>');
		}
		var showLoading = () => {
			$(overlay).fadeIn(200);
			$(loading).fadeIn(300);
		}
		var hideLoading = () => {
			$(overlay).fadeOut(200);
			$(loading).fadeOut(300);
		}
		var requestToken = pid => {
			var req = new Request(window.tokenServer + "?pid=" + pid, window.requestConfig);
			return fetch(req);
		}
		$("#title").toggle();
		$(".start-body").toggle();
		$(".description").toggle();
		$(joinArea).toggle();
		$(tooltipArea).toggle();
		$(waitingArea).toggle();
		$(loadingArea).toggle();
		// Load animations
		$("#title").slideDown({duration: 500});
		setTimeout(() => {
			$(".description").fadeIn(500);
			setTimeout(() => {
				$(".start-body").fadeIn(300);
			}, 300);
		}, 300);
		join.addEventListener('click', () => {
			window.pid = pidBox.value;
			// Do sanity checks before requesting for a token
			if (!pid || pid === "" || (isNaN(parseInt(pid)))) {
				showAlert('You entered an invalid PID! Please retry.');
				return;
			} else {
				showLoading();
				// Request for token
				requestToken(pid).then(response => {
					hideLoading();
					response.json().then(resObject => {
						if (resObject.error) {
							setTimeout(() => {
								showAlert("Your PIN is invalid! The Kahoot server responded with:\n" + resObject.responseCode);
							}, 200);
							return;
						} else {
							console.debug('Got response object:', resObject);
							var challengeObject = null;
							resObject.responseBody = resObject.responseBody.replace('console.log("Offset derived as:", offset);', "");
							try {
								challengeObject = JSON.parse(resObject.responseBody);
							} catch (e) {
								console.debug('There was an error parsing the challenge JSON:');
								console.error(e);
								setTimeout(() => {
									showAlert("There was an error processing the server's response.");
								}, 200);
								return;
							}
							if (challengeObject !== null) {
								window.token = getKahootToken(resObject.tokenHeader, challengeObject.challenge);
								if (token) {
									console.debug('Resolved token', token);
									$(start).fadeOut(300);
									setTimeout(() => {
										$(joinArea).fadeIn(300);
									}, 300);
								} else {
									setTimeout(() => {
										showAlert("There was an error resloving the join token.\nPlease use another PIN.");
									});
									return;
								}
							}
						}
					}).catch(err => {
						console.debug('There was an error parsing the response JSON:');
						console.error(err);
						setTimeout(() => {
							showAlert("There was an error processing the server's response.");
						}, 200);
						return;
					});
				}).catch(error => {
					hideLoading();
					setTimeout(() => {
						showAlert("There was an error requesting for the session token.\nMake sure you are using the correct PIN.");
						console.error(error);
					}, 500);
				});
			}
		});
		alertOk.addEventListener('click', () => {
			$(alertBox).fadeOut(300);
			$(overlay).fadeOut(200);
		});
		tooltip.addEventListener('mouseenter', () => {
			$(tooltipArea).fadeIn	(200);
		});
		tooltip.addEventListener('mouseleave', () => {
			$(tooltipArea).fadeOut(200);
		});
		joinButton.addEventListener('click', () => {
			if (nameArea.value) window.name = nameArea.value;
			if (clientCount.value) window.clients = clientCount.value;
			if (parseInt(window.clients) > 67) {
				showAlert("The maximum amount of clients allowed is 67.");
				return;
			}
			showLoading();
			window.wsURI += window.pid;
			window.wsURI += "/";	
			window.wsURI += window.token;
			for (var i = 0; i < window.clients; ++i) {
				// Connect each KahootSocket to the server.
				if (i == 0) clients.push(new KahootSocket(wsURI, true, ""));
				else clients.push(new KahootSocket(wsURI, false, i));
			}
			KahootSocket.getReady().then(() => { // Wait until all of them have opened
				hideLoading();
				$(joinArea).fadeOut(250);
				$(waitingArea).fadeIn(250);
				isWaiting = true;
				var pulse = false;
				var waitInterval = setInterval(() => { // Make the waiting text 'glow'
					if (isWaiting) {
						if (pulse) {
							waitText.style.opacity = 1;
						} else {
							waitText.style.opacity = 0.5;
						}
						pulse = !pulse;
					} else {
						clearInterval(waitInterval);
						return;
					}
				}, 750);
			});
		});
	});
})();