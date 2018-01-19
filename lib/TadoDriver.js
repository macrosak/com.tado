'use strict';

const Homey = require('homey');
const TadoApi = require('./TadoApi');

class TadoDriver extends Homey.Driver {
	
	onPair( socket ) {
		
		let tadoApi = new TadoApi();
		
        let myOAuth2Callback = new Homey.CloudOAuth2Callback( tadoApi.getAuthorizationUrl() );
        	myOAuth2Callback.on('url', url => {
                socket.emit('url', url);
        	}).on('code', code => {
	        	
				tadoApi.getOAuth2Token( code ).then(token => {
					tadoApi.setToken(token);
					socket.emit('authorized');
				}).catch( err => {
		        	this.error( err );
                	socket.emit('error', err);
				})
				
        	}).generate().catch( err => {
	        	this.error( err );
               	socket.emit('error', err);		        	
        	})
		
		socket.on('list_devices', ( data, callback ) => {
			let homeId;
			tadoApi.getMe()
				.then( result => {
					let promises = [];
					
					result.homes.forEach( home => {
						let promise = tadoApi.getZones( home.id )
							.then( result => {
								return {
									home: home,
									zones: result
								}
							});
						promises.push( promise );
					});
					
					return Promise.all( promises );
				})
				.then( result => {
					//console.log('result', JSON.stringify(result, false, 4))
					
					return this._onPairListDevices( result )
				})
				.then( devices => {
					devices = devices.map( device => {						
						device.store = {
							token: tadoApi.getToken(),
						}
						return device;
					})
					callback( null, devices );
				})
				.catch( err => {
					this.error( err );
					callback( err );
				});
		});
		
	}
	
	async _onPairListDevices( result ) {
		return [];
	}
	
}

module.exports = TadoDriver;