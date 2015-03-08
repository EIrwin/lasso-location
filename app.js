var socket = require('express.io')();
var moment = require('moment');
var settings = require('./settings');
var schedule = require('node-schedule');
var geolib = require('geolib');

socket.http().io();

socket.io.route('init', function(req){
    req.io.join(req.data);
    req.io.join(req.data + ':ctrl');
    var room = req.io.room(req.data + ':ctrl');
    room.broadcast('locate');
});

socket.io.route('announce', function(req){

    //send updated coordinates to anyone listening to the main room for this user.
    req.io.room(req.data.id).broadcast('update', req.data);

    //TODO: fetch nearest coordinate to self given an array of lassos and friends coordinates.

    //TODO: determine distance between self and nearest coordinate in feet.
    var distance = 5200;

    var milliseconds = Math.round(Math.pow(distance / settings.resolution, settings.throttle) * 1000);

    var room = req.io.room(req.data.id + ':ctrl');
    var job = new schedule.Job(function(){ room.broadcast('locate'); });
    job.schedule(moment().add(milliseconds, 'milliseconds'));
});

module.exports = socket;
