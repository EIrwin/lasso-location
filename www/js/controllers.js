angular.module('ionic-geofence')
    
    .controller('CoordinatesCtrl', function ($scope, $log, geolocationService, geofenceService, $ionicLoading) {
        $log.info('Coordinates controller loaded...');

        $ionicLoading.show({
            template:'Obtaining current location...',
            duration:3000
        });
        var options = {
          enableHighAccuracy: true,
          timeout: 40000,
          maximumAge: 0
        };

        $scope.coordinates = [];

        navigator.geolocation.watchPosition(function(position){
            $log.info('position changed',position)

            $scope.coordinates.push({
                latitude:position.coords.latitude,
                longitude:position.coords.longitude
            })

            $scope.$apply();
        
        },function(reason){
            $log.error('watchPosition failed',reason)
        },options)

    })
    .controller('MapCtrl', function ($scope, $log, geolocationService, geofenceService, $ionicLoading) {
        $log.info('Map controller loaded...');

        $ionicLoading.show({
            template:'Obtaining current location...',
            duration:3000
        });

        var lat = 33.729533599999996;
        var lng = -111.98840829999999;

        $scope.center = {
            lat:lat,
            lng:lng,
            zoom:12
        };

        $scope.markers = {
            marker: {
                draggable: true,
                message: 'Sample message',
                lat: lat,
                lng: lng,
                icon: {}
            }
        };

        $scope.paths = {
            circle: {
                type: 'circle',
                radius: 10,
                latlngs: $scope.markers.marker,
                clickable: false
            }
        };

        var options = {
          enableHighAccuracy: true,
          timeout: 40000,
          maximumAge: 0
        };

        $scope.coordinates = [];

        navigator.geolocation.watchPosition(function(position){
            $log.info('position changed',position)

            $scope.markers.marker = {
                draggable:false,
                message:'Current Position',
                lat:position.coords.latitude,
                lng:position.coords.longitude,
                icon:{}
            };

            $scope.$apply();
        
        },function(reason){
            $log.error('watchPosition failed',reason)
        },options)

        // geolocationService.getCurrentPosition()
        //     .then(function(position){
        //         $log.info('current location found');
        //         $ionicLoading.hide();

        //         $scope.center = {
        //             lat:position.coords.latitude,
        //             lng:position.coords.longitude,
        //             zoom:12
        //         }

        //         $scope.markers = {
        //             marker: {
        //                 draggable: true,
        //                 message: 'Sample message',
        //                 lat: position.coords.latitude,
        //                 lng: position.coords.longitude,
        //                 icon: {}
        //             }
        //         };

        //         $scope.paths = {
        //             circle: {
        //                 type: 'circle',
        //                 radius: 10,
        //                 latlngs: $scope.markers.marker,
        //                 clickable: false
        //             }
        //         };


        //     },function(reason){
        //         $log.error('An error has occured',reason);
        //         $ionicLoading.hide();
        //     })

    })
    .controller('GeofencesCtrl', function ($scope, $ionicActionSheet, $timeout, $log, $state, geolocationService, geofenceService, $ionicLoading, $ionicActionSheet) {
        $log.info('Geofences controller loaded...');
        $ionicLoading.show({
            template: 'Getting geofences from device...',
            duration: 5000
        });

        $scope.geofences = [];

        geofenceService.getAll().then(function (geofences) {
            $log.info('geofenceService.getAll() success');
            $ionicLoading.hide();
            $scope.geofences = geofences;
        }, function (reason) {
            $ionicLoading.hide();
            $log.error('An Error has occured', reason);
        });

        $scope.createNew = function () {
            $log.info('Obtaining current location...');
            $ionicLoading.show({
                template: 'Obtaining current location...'
            });
            geolocationService.getCurrentPosition()
                .then(function (position) {
                    $log.info('Current location found');
                    $ionicLoading.hide();

                    geofenceService.createdGeofenceDraft = {
                        id: UUIDjs.create().toString(), //we might want to override this with contextual formatting
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        radius: .01,
                        transitionType: TransitionType.ENTER,
                        notification: {
                            id: geofenceService.getNextNotificationId(),
                            title: 'Ionic geofence example',
                            text: '',
                            icon: 'res://ic_menu_mylocation',
                            openAppOnClick: true
                        }
                    };
                    $state.go('geofence', {
                        geofenceId: geofenceService.createdGeofenceDraft.id
                    });
                }, function (reason) {
                    $log.error('Cannot obtain current location', reason);
                    $ionicLoading.show({
                        template: 'Cannot obtain current location',
                        duration: 1500
                    });
                });
        };

        $scope.editGeofence = function (geofence) {
            $state.go('geofence', {
                geofenceId: geofence.id
            });
        };

        $scope.removeGeofence = function (geofence) {
            geofenceService.remove(geofence);
        };

        $scope.more = function () {
            // Show the action sheet
            $ionicActionSheet.show({
                buttons: [
                    { text: 'Test application' }
                ],
                destructiveText: 'Delete all geofences',
                titleText: 'More options',
                cancelText: 'Cancel',
                destructiveButtonClicked: function () {
                    geofenceService.removeAll();
                    return true;
                },
                buttonClicked: function(index) {
                    window.location.href = 'cdvtests/index.html';
                }
            });
        };
    })

.controller('GeofenceCtrl', function ($scope, $state, $ionicLoading, geofence, geofenceService) {

    $scope.geofence = geofence;
    $scope.TransitionType = TransitionType;

    $scope.center = {
        lat: geofence.latitude,
        lng: geofence.longitude,
        zoom: 12
    };

    $scope.markers = {
        marker: {
            draggable: true,
            message: geofence.notification.text,
            lat: geofence.latitude,
            lng: geofence.longitude,
            icon: {}
        }
    };

    $scope.paths = {
        circle: {
            type: 'circle',
            radius: geofence.radius,
            latlngs: $scope.markers.marker,
            clickable: false
        }
    };

    $scope.isTransitionOfType = function (transitionType) {
        return ($scope.geofence.transitionType & transitionType);
    };

    $scope.isWhenGettingCloser = function () {
        return $scope.geofence.transitionType === TransitionType.ENTER;
    };

    $scope.toggleWhenIgetCloser = function () {
        $scope.geofence.transitionType ^= TransitionType.ENTER;
    };

    $scope.toggleWhenIamLeaving = function () {
        $scope.geofence.transitionType ^= TransitionType.EXIT;
    };

    $scope.save = function () {
        if (validate()) {
            $scope.geofence.radius = parseInt($scope.paths.circle.radius);
            $scope.geofence.latitude = $scope.markers.marker.lat;
            $scope.geofence.longitude = $scope.markers.marker.lng;
            $scope.geofence.notification.data = angular.copy($scope.geofence);

            geofenceService.addOrUpdate($scope.geofence);
            $state.go('geofences');
        }
    };

    function validate () {
        if (!$scope.geofence.notification.text) {
            $ionicLoading.show({
                template: 'Please enter some notification text.',
                duration: 3000
            });
            return false;
        }

        if ($scope.geofence.transitionType === 0) {
            $ionicLoading.show({
                template: 'You must select when you want notification. When entering or/and exiting region?',
                duration: 3000
            });
            return false;
        }
        return true;
    };
});
