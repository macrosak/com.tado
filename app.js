'use strict';

const Homey = require('homey');
const TadoOAuth2Client = require('./lib/TadoOAuth2Client');
const { OAuth2App } = require('homey-oauth2app');

const SCOPES = [
	'identity:read',
	'home.details:read',
	'home.operation:read',
	'home.operation:write',
	'home.webhooks',
	'home.mobile.devices.details:read',
	'home.mobile.devices.location:read'
];

class TadoApp extends OAuth2App {

	onOAuth2Init() {
  	
  	//this.enableOAuth2Debug();
  	this.setOAuth2Config({
    	client: TadoOAuth2Client,
    	apiUrl: 'https://my.tado.com/api/v2',
    	tokenUrl: 'https://auth.tado.com/oauth/token',
    	authorizationUrl: 'https://auth.tado.com/oauth/authorize',
    	scopes: SCOPES,
  	});
  	
		this.log('TadoApp is running...');
	}

}

module.exports = TadoApp;
