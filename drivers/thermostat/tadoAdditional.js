'use strict';
//reused subs and data for device.js and drivers.js

const Homey = require('homey');

exports.getWeatherConditions = function(args){
  // confirmed ids by observing received conditions
  // "sun", "cloudy_partly", "cloudy_mostly", "cloudy", "foggy",
  // "drizzle", "scattered_rain", "rain", "thunderstorm", "night_clear", "night_cloudy",
  // "scattered_rain_snow", "rain_snow",
  // "snow"
  //
  // ids derived from original tado weather-image names. Still need confirmation.
  // "rain_hail", "hail",
  // "scattered_snow", "freezing", "windy"
  //
  return [
    "sun",
    "cloudy_partly", "cloudy_mostly", "cloudy", "foggy",
    "drizzle", "scattered_rain", "rain",
    "rain_hail", "hail",
    "scattered_rain_snow", "rain_snow",
    "scattered_snow", "snow",
    "freezing",
    "windy",
    "thunderstorm",
    "night_clear", "night_cloudy"
  ];
}

exports.getAutocompleteWeatherCondition = function(args){
  var arrayAutocomplete = [],
      weatherConditionsList = this.getWeatherConditions();

  weatherConditionsList.forEach( function( item ){
    var mobileIcon = '/app/com.tado/drivers/thermostat/assets/weather_' + item + '.svg';
    arrayAutocomplete.push({
      icon: mobileIcon,
      name: Homey.__( item ),
      condition: item
    });
  });
  return arrayAutocomplete;
}

exports.getAutocompleteTemperature = function(args){
  switch(args.device._type){
    case 'AIR_CONDITIONING':
      var tMin = 16, tMax = 30, tStep = 1, xFix = 0;
      if(args.device._zoneCapabilities.COOL){
        tMin = args.device._zoneCapabilities.COOL.temperatures.celsius.min
      }
      if(args.device._zoneCapabilities.HEAT){
        tMax = args.device._zoneCapabilities.HEAT.temperatures.celsius.max
      }
      break;

    case 'HEATING': case 'HOT_WATER':
      var xFix = 0;
      var tMin = args.device._zoneCapabilities.temperatures.celsius.min;
      var tMax = args.device._zoneCapabilities.temperatures.celsius.max;
      var tStep = args.device._zoneCapabilities.temperatures.celsius.step;
      break;
  }
  if( tStep < 1 ){ tStep = 0.5; xFix = 1; }
  var arrayAutocomplete = [];
  for( var i = tMin; i <= tMax; i += tStep ) {
    arrayAutocomplete.push({
      name: i.toFixed(xFix) + ' °C',
      celsius: i
    });
  }
  return arrayAutocomplete;
}

exports.getAutocompleteAircoMode = function(args){
  var arrayAutocomplete = this.getAircoModes(args, [ "cool", "heat", "fan", "dry", "auto" ]);
  arrayAutocomplete.push({
    icon: '/app/com.tado/drivers/thermostat/assets/airco_mode_off.svg',
    name: Homey.__( 'Off' ),
    mode: 'Off'
  });
  return arrayAutocomplete;
}

exports.getAutocompleteAircoCoolHeat = function(args){
  return this.getAircoModes(args, [ "cool", "heat" ]);
}

exports.getAircoModes = function( args, possibleModes ){
  var arrayAutocomplete = [],
      mobileIcon = '/app/com.tado/drivers/thermostat/assets/airco_mode_off.svg';

  possibleModes.forEach( function( item ){
    if(args.device._zoneCapabilities[ item.toUpperCase() ]){ // check if AC mode is available
      var xText = item.substr(0,1).toUpperCase() + item.substr(1).toLowerCase();
      mobileIcon = '/app/com.tado/drivers/thermostat/assets/airco_mode_' + item.toLowerCase() + '.svg';
      arrayAutocomplete.push({
        icon: mobileIcon,
        name: Homey.__( xText ),
        mode: xText
      });
    }
  });
  return arrayAutocomplete;
}

exports.getAutocompleteMobileDevices = function(args){
  var arrayAutocomplete = [];

  args.device.getStoreValue('mobileDevices').forEach(function(item){
    if( item.settings.geoTrackingEnabled){ // LBC = on
      if(item.location !== null && item.location !== undefined){ // connection = ok (<35 hours)
        if(item.location.stale === false){ // location = ?
          if(item.location.atHome === true){ // device = at home
            var mobileIcon = 'location_home.svg';
          } else { // device = away
            var mobileIcon = 'location_away.svg';
          }
        } else { // LBC = on, but no ? for 35 hours or more
          var mobileIcon = 'location_stale.svg';
        }
      } else { // LBC is/was on, but no location update to tado server for 48 hours or more
        var mobileIcon = 'location_null.svg';
      }
    } else { // LBC = off
      var mobileIcon = 'location_off.svg';
    }
    mobileIcon = '/app/com.tado/drivers/thermostat/assets/' + mobileIcon;
    arrayAutocomplete.push({
      icon: mobileIcon,
      name: item.name,
      id: item.id
    });

  });
  return arrayAutocomplete;
}

exports.getAutocompleteMobileDevicesLocationBased = function(args){
  var arrayAutocomplete = [];
  args.device.getStoreValue('mobileDevices').forEach(function(item){
    if( item.settings.geoTrackingEnabled ){

      if(item.location !== null && item.location !== undefined){
        if(item.location.stale === false){
          if(item.location.atHome === true){
            var mobileIcon = 'location_home.svg';
          } else {
            var mobileIcon = 'location_away.svg';
          }
        } else {
          var mobileIcon = 'location_stale.svg';
        }
      } else {
        var mobileIcon = 'location_null.svg';
      }
      mobileIcon = '/app/com.tado/drivers/thermostat/assets/' + mobileIcon;

      arrayAutocomplete.push({
        icon: mobileIcon,
        name: item.name,
        id: item.id
      });
    }
  });
  return arrayAutocomplete;
}


// helpers for tado data.
exports.conversionFactors = function(){
  // conversion factors for relativeDistanceFromHomeFence <-> kilometers conversion.
  return { xFactor: 0.01981, powFactor: 3.42 };
  // used at convertKilometerToRelative(km) and convertRelativeToKilometer(rel).
  // xFactor (unit factor) and powFactor  (logarithmic raise) are experimentally determined
  // with Android 7 + Fake-GPS app + Google Earth measurements + Excel sheet calculations.
  // accuracy >99% @ 1 kilometer, about 96% @ 4000 km.
}

exports.convertRelativeToKilometer = function(distRelative){ // 0...1
// convert tado's relativeDistanceFromHomeFence to kilometers.
	if( distRelative === 0 ){
		var km = 0;
	} else {
		var km = this.conversionFactors().xFactor * Math.pow( this.conversionFactors().powFactor, distRelative * 10 );
	}
	if( km < 10 ){
		km = km.toFixed(2);
	} else if( km < 100 ){
		km = km.toFixed(1);
	} else {
		km = km.toFixed(0);
	}
	return Number( km );
}

exports.convertKilometerToRelative = function(distKilometer){ // 0...4000+
// convert kilometers to tado's relativeDistanceFromHomeFence.
	if( distKilometer === 0 ){
		var rel = 0;
	} else {
		if( distKilometer < 0.03 ){ distKilometer = 0.03; }
		if( distKilometer > 4000 ){ distKilometer = 4000; }
		var rel = 0.1 / ( Math.log( this.conversionFactors().powFactor ) / Math.log( distKilometer / this.conversionFactors().xFactor ) );
	}
	return rel;
}

exports.convertKilometerToMile = function(distKilometer){
// convert Kilometer to Mile.
	var mi = 0.62137119224 * distKilometer;
	if( mi < 10 ){
		mi = mi.toFixed(2);
	} else if( mi < 100 ){
		mi = mi.toFixed(1);
	} else {
		mi = mi.toFixed(0);
	}
	return Number( mi );
}


// for debug use
exports.doLog = function(logText){
   // logText with word(s) in filterShow is shown. Empty filterShow = show everything
  var filterShow = ['woning', 'bearingFromHome'],
      // words in filterDontShow override filterShow
      filterDontShow = ['minutesSinceLocation'],
      enableShow = false;

  if(filterShow.length === 0){
    enableShow = true
  } else {
    filterShow.forEach(function(item){
      if(logText.toLowerCase().indexOf(item.toLowerCase()) > -1){
        enableShow = true
      }
    });
  }
  filterDontShow.forEach(function(item){
    if(logText.toLowerCase().indexOf(item.toLowerCase()) > -1){
      enableShow = false
    }
  });
  if(enableShow){
    console.log( new Date().toLocaleString() + ': ' + logText.trim() );
  }
}
