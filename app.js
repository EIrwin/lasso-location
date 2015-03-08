var socket = require('express.io')();
var moment = require('moment');
var settings = require('./settings');
var schedule = require('node-schedule');
var geolib = require('geolib');

function locate(room){
    room.broadcast('locate');
}

socket.http().io();

socket.io.route('init', function(req){
    req.io.join(req.data);
    req.io.join(req.data + ':ctrl');
    var room = req.io.room(req.data + ':ctrl');
    locate(room);
});

socket.io.route('announce', function(req){

    //fetch nearest coordinate to self given an array of lassos and friends coordinates.

    //determine distance between self and nearest coordinate in feet.
    var distance = 5200;

    //seconds until next update = (distance / resolution)^throttle where throttle is less than 1.
    var seconds = Math.round(Math.pow(distance / settings.resolution, settings.throttle));

    //schedule locate broadcast for the control room.
    var room = req.io.room(req.data.id + ':ctrl');
    var job = new schedule.Job(function(){ locate(room); });
    job.schedule(moment().add(seconds, 'seconds'));

    req.io.room(req.data.id).broadcast('update', req.data);
});

module.exports = socket;
