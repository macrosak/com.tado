'use strict';
// Insights and FlowTokens for mobile phones and tablets

const Homey = require('homey');
const tadoSub = require('./tadoAdditional');

var mobileTokens = {}, // Dynamic FlowTokens for mobile phones and tablets
    mobileTokensIndex = []; // index for mobile phones and tablets FlowTokens

class tadoMobileInsights {

  createInitialMobileInsights( status ) {
    // create all initial Insights data for status.id
    var insightLogEntries = [
          'geoTrackingEnabled',
          'atHome',
          'distanceFromHomeFence'
        ],
        thisMobileDevice = this;
    insightLogEntries.forEach(function(item) {
      Homey.ManagerInsights.getLog( item.toLowerCase() + '_' + status.id, function(err, logs) {
    		if(err !== null) {
          if( item === 'geoTrackingEnabled' || (status.location !== null && status.location !== undefined)) {
            thisMobileDevice.mobileEntry( status, item )
          }
    		}
    	});
    });
  }

  mobileEntry( status, dataName ) {
    // status: Mobile device object from tado API
    // dataName: 'geoTrackingEnabled', 'atHome', 'distanceFromHomeFence'
    dataName = dataName.toLowerCase();
    switch( dataName ) {
      case 'geotrackingenabled':
        var logValue = status.settings.geoTrackingEnabled;
        var insightOptions = {
          label: {
            en: status.name + ', Location-based control',
            nl: status.name + ', Locatiegebaseerde controle'
          },
          type: 'boolean',
          units: {
            en: 'On',
            en: 'Aan'
          }
        };
        break;

      case 'athome':
        var logValue = status.location.atHome;
        if(logValue === undefined || logValue === null ) {
          logValue = true
        }
        var insightOptions = {
          label: {
            en: status.name + ', In Home Area',
            nl: status.name + ', In Woongebied'
          },
          type: 'boolean',
          units: {
            en: 'Yes',
            nl: 'Ja'
          }
        };
        break;

      case 'distancefromhomefence':
        var logValue = status.location.relativeDistanceFromHomeFence;
        if(logValue === undefined || logValue === null ) {
          logValue = 0
        }
        logValue = tadoSub.convertRelativeToKilometer(Number(logValue));
        var insightOptions = {
          label: {
            en: status.name + ', Distance',
            nl: status.name + ', Afstand'
          },
          type: 'number',
          units: {
            en: 'km from Home Area',
            nl: 'km van Woongebied'
          },
          decimals: 2
        };
        break;
    }
    var logName = dataName + '_' + status.id,
        logDate = new Date();

    if( logValue !== null ) {
      Homey.ManagerInsights.getLog( logName, function(err, logs) {
        if(err !== null) {
          Homey.ManagerInsights.createLog(
            logName,
            insightOptions,
            function callback(err, log) {
              if(err) {
                if(err.message !== 'already_exists') {
                  console.error(err);
                }
              } else {
              	log.createEntry( logValue, logDate, function(err, success) {
              		if(err) { console.error(err) };
              	});
              }
            }
          );

        } else {
        	logs.createEntry( logValue, logDate, function(err, success) {
        		if(err) { console.error(err) };
        	});
        }
      });
    }
    this.mobileTokenEntry( status, dataName );
    if( dataName === 'distancefromhomefence' ) {
      this.mobileTokenEntry( status, 'relativedistancefromhomefence' );
    }
  }

  cleanMobileInsights( mobileDevices ) {
    // remove Insights for phones/tablets that have been removed from:
    // tado mobile app / Settings / People / Account
    var availableMobileDeviceIds = [],
        logsToRemove = [],
        thisDev = this;

    mobileDevices.forEach(function(item) { // collect IDs for available phones/tablets
      availableMobileDeviceIds.push(Number( item.id ))
    });
    Homey.ManagerInsights.getLogs( function(err, logs) { // get logs to compare name_ID
  		if (err === null) {
        logs.forEach(log => {
          var keepInsight = false;
          var id = ( log.id || log.name );
          availableMobileDeviceIds.forEach(function(idCheck) {
            if( Number( id.substr(id.indexOf('_') + 1) ) === idCheck ) { // compare insight_ID to available mobile device IDs
              keepInsight = true
            }
          });
          if( !keepInsight ) { // store insight when associated mobile device is not connected anymore
            logsToRemove.push(id)
          }
        });
        logsToRemove.forEach(log => { // remove stored insights
          thisDev.deleteMobileInsight( log )
        });
  		}
  	});

    this.cleanMobileTokens( mobileDevices );
  }

  deleteMobileInsight( logName ) {
    Homey.ManagerInsights.getLog(logName, function(err, logs) {
  		if(err === null) {
        Homey.ManagerInsights.deleteLog( logs, function(err, success) {
    			if(err) { console.error(err) };
    		});
  		}
  	});
  }


  mobileTokenEntry( status, dataName ) {
    // status: Mobile device object from tado API
    // dataName: 'geoTrackingEnabled', 'atHome', 'distanceFromHomeFence'
    dataName = dataName.toLowerCase();
    switch( dataName ) {
      case 'geotrackingenabled':
        var tokenValue = status.settings.geoTrackingEnabled;
        var tokenOptions = {
          title: status.name + ', ' + Homey.__('Location-based control'),
          type: 'boolean'
        };
        break;

      case 'athome':
        var tokenValue = status.location.atHome;
        if(tokenValue === undefined || tokenValue === null ) {
          tokenValue = true
        }
        var tokenOptions = {
          title: status.name + ', in ' + Homey.__('Home Area'),
          type: 'boolean'
        };
        break;

      case 'relativedistancefromhomefence':
        var tokenValue = status.location.relativeDistanceFromHomeFence;
        if(tokenValue === undefined || tokenValue === null ) {
          tokenValue = 0
        }
        var tokenOptions = {
          title: status.name + ', ' + Homey.__('Distance') + ' (' + Homey.__('relative') + ')',
          type: 'number'
        };
        break;

      case 'distancefromhomefence':
        var tokenValue = status.location.relativeDistanceFromHomeFence;
        if(tokenValue === undefined || tokenValue === null ) {
          tokenValue = 0
        }
        tokenValue = tadoSub.convertRelativeToKilometer(Number(tokenValue));
        var tokenOptions = {
          title: status.name + ', ' + Homey.__('Distance') + ' (km)',
          type: 'number'
        };
        break;

    }
    var tokenName = dataName + '_' + status.id;
    if( mobileTokens[tokenName] === undefined ) {
      mobileTokensIndex.push(tokenName);
      mobileTokens[tokenName] = new Homey.FlowToken( tokenName, tokenOptions);
        mobileTokens[tokenName].register()
        .then(() => {
          return mobileTokens[tokenName].setValue( tokenValue );
        })
        .catch(console.error)
    } else {
      return mobileTokens[tokenName].setValue( tokenValue ).catch(console.error);
    }
  }

  cleanMobileTokens( mobileDevices ) {
    // remove FlowTokens for phones/tablets that have been removed from:
    // tado mobile app / Settings / People / Account
    var availableMobileDeviceIds = [],
        tokensToRemove = [],
        tokensIndexToRemove = [],
        thisDev = this;

    mobileDevices.forEach(function(item) { // collect IDs for available phones/tablets
      availableMobileDeviceIds.push(Number( item.id ))
    });
    mobileTokensIndex.forEach(function(itemIndex, index) {
      var keepToken = false;
      availableMobileDeviceIds.forEach(function(idCheck) {
        if( Number( itemIndex.substr(itemIndex.indexOf('_') + 1) ) === idCheck ) { // compare Token_ID to available mobile device IDs
          keepToken = true
        }
      });
      if( !keepToken ) { // store Token when associated phone/tablet is not connected anymore
        tokensToRemove.push(itemIndex)
        tokensIndexToRemove.push(index)
      }
    });
    tokensToRemove.forEach(function(item) { // remove stored tokensToRemove
      thisDev.deleteMobileToken( item )
    });
    tokensIndexToRemove.forEach(function(item) { // remove stored tokensIndexToRemove
      delete mobileTokensIndex[item]
    });
  }


  deleteMobileToken( tokenName ) {
    mobileTokens[tokenName].unregister()
      .then(() => {
        delete mobileTokens[tokenName];
      })
      .catch( err => {
          console.log( err );
      })
  }

}

module.exports = tadoMobileInsights;
