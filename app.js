'use strict';

const Homey = require('homey');
const TadoApi = require('./lib/TadoApi');

class TadoApp extends Homey.App {

	onInit() {

		this.log('TadoApp is running...');

		if( typeof Homey.env.CLIENT_ID === 'undefined' )
			throw new Error('Missing Client ID. Make sure your env.json is present.');

		if( typeof Homey.env.CLIENT_SECRET === 'undefined' )
			throw new Error('Missing Client Secret. Make sure your env.json is present.');
	}

}

module.exports = TadoApp;
