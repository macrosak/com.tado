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





				// get tado zone capabilities and add to zone objects
					let promises = [];
					result.forEach( (homeItem, homeIndex) => {
						homeItem.zones.forEach( ( zone, zoneIndex ) => {
							let promise = tadoApi.getZoneCapabilities( homeItem.home.id, zone.id )
								.then( zoneCap => {
									zone.zoneCapabilities =  zoneCap

									return {
										home: homeItem.home,
										zone: zone
									}
								})
							promises.push( promise );
						});
					});
					return Promise.all( promises );
				})

				.then( result => {
					// prepaire result for _onPairListDevices
					var zones_new = []
					result.forEach(function(item, index){
						zones_new.push(item.zone)
					});

					// add TADO_HOME device for weather and detailed mobile data
					zones_new.push({
						id: result[0].zone.id,
						name: Homey.__('Home'),
						type: 'TADO_HOME'
					})

					result = [{
						home: result[0].home,
						zones: zones_new
					}]




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
