friendFetcher = { 
	methods: {
		getMixerId: function(username) {
		// This gets a channel id using a mixer username.
			return new Promise(function(resolve, reject) {

				var request = new XMLHttpRequest();
				request.open('GET', 'https://mixer.com/api/v1/channels/'+username+'?fields=userId', true);

				request.onload = function() {
					if (request.status >= 200 && request.status < 400) {
					// Success!
						var data = JSON.parse(request.responseText);
						resolve(data.userId);
					} else {
					// We reached our target server, but it returned an error
					// TODO: Display a message in the extension.
						reject('Login at Mixer.com to see your online friends.');
					}
				};

				request.onerror = function() {
				// There was a connection error of some sort
					reject('Error getting userId');
				};

				request.send();
			});
		},
		getMixerFollows: function(userId, page, followList){
		// This will get 50 follows on a specific page.
			return new Promise(function(resolve, reject) {
			// To test a lot of follows, uncomment the line below.
			// var userId = 313842;
				console.log('Trying page '+page+' of follows for userId '+userId);

				var request = new XMLHttpRequest();
				request.open('GET', 'https://mixer.com/api/v1/users/'+userId+'/follows?fields=id,online,name,token,viewersCurrent,partnered,costreamId,interactive,type&where=online:eq:true&order=token:ASC&limit=250&page='+page, true);

				request.onload = function() {
					if (request.status >= 200 && request.status < 400) {
					// Success!
						var data = JSON.parse(request.responseText);

						// Loop through data and throw in array.
						for (friend of data){
							followList.push(friend);
						}
					
						// If we hit 50 friends, cycle again because we've run out of friends on this api call.
						resolve(followList);

					} else {
					// We reached our target server, but it returned an error
						reject('Error getting followed channels.');
					}
				};

				request.onerror = function() {
				// There was a connection error of some sort
					reject('Error while getting followed channels.');
				};

				request.send();
			});
		},
		outputMixerFollows: function(username){
			var app = this;
			// This combines two functions so that we can get a full list of online followed channels with a username.
			return new Promise((resolve, reject) => {
				var page = 0;
				app.getMixerId(username)
					.then((userId) =>{
						app.getMixerFollows(userId, page, [])
							.then((followList) =>{
								resolve(followList);
							})
							.catch((err) => {
								reject(err);
							});
					})
					.catch((err) => {
						reject(err);
					});
			});
		}
	}
};