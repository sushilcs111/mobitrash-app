angular.module('app.controllers', [])

        .controller('AppCtrl', function ($scope, $localstorage) {
            $scope.base = 'http://mobitrash.cruxservers.in/operator/';

            $scope.isLogin = function () {
                if ($localstorage.uid()) {
                    return true;
                } else {
                    return false;
                }
            }

        })
        .controller('markAttendanceCtrl', function ($scope, $localstorage, $http, $ionicPopup) {
            $scope.user = {};
            if ($localstorage.uid()) {
                $scope.user = $localstorage.getObject('user');
            }
            console.log($scope.user.first_name);
            $scope.login = function (formdata) {
                $http({
                    url: $scope.base + 'login',
                    method: 'POST',
                    data: {id: formdata.user.id}
                }).then(function successCallback(response) {
                    if (response.data.flash == 'success') {
                        $localstorage.setObject('user', response.data.User);

                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Login Error',
                            template: 'Invalid ID'
                        });
                    }
                }, function errorCallback(response) {
                });
            }
        })

        .controller('scheduleForTheDayCtrl', function ($scope, $localstorage, $http, $ionicPopup) {
            $scope.schedules = {};
            if ($localstorage.uid()) {
                $http({
                    url: $scope.base + 'schedules',
                    method: 'POST',
                    data: {id: $localstorage.uid()}
                }).then(function successCallback(response) {
                    if (response.data.flash == 'success') {
                        $scope.schedules = response.data.Schedules;
                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Error Occured!',
                            template: 'Error Occured! Please try again!'
                        });
                    }
                }, function errorCallback(response) {
                });
            }
        })

        .controller('cleaningCtrl', function ($scope) {

        })

        .controller('receiptsCtrl', function ($scope) {

        })

        .controller('getClickedCtrl', function ($scope) {

            var objCanvas = document.getElementById("video");
            window.plugin.CanvasCamera.initialize(objCanvas);

        })

        .controller('pickupDetailsCtrl', function ($scope, $http, $stateParams, $localstorage, $ionicPopup) {
            $scope.wastetypes = {};
            $scope.pickup = {};
            $http({
                url: $scope.base + 'pickup-details',
                method: 'POST',
                data: {id: $stateParams.pickupid}
            }).then(function successCallback(response) {
                if (response.data.flash == 'success') {
                    $scope.wastetypes = response.data.Wastetype;
                    $scope.pickup = response.data.Pickup;
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error Occured!',
                        template: 'Error Occured! Please try again!'
                    });
                }
            }, function errorCallback(response) {
            });

            $scope.savePickup = function (formdata) {
                
                $http({
                    url: $scope.base + 'save-service-details',
                    method: 'POST',
                    data: {service:formdata.Pickup,pickup:$scope.pickup}
                }).then(function successCallback(response) {
                    if (response.data.flash == 'success') {
                         var alertPopup = $ionicPopup.alert({
                            title: 'Success!',
                            template: 'Data saved Successfully!'
                        });
                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Error Occured!',
                            template: 'Error Occured! Please try again!'
                        });
                    }
                }, function errorCallback(response) {
                });

            };

        })

        .controller('routeCtrl', function ($scope) {
            $scope.$on('$ionicView.afterEnter', function () {
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 7

                });

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        map.setCenter(initialLocation);
                        directionsService.route({
                            origin: initialLocation,
                            destination: "Mulund,Mumbai",
                            travelMode: google.maps.TravelMode.DRIVING
                        }, function (response, status) {
                            if (status === google.maps.DirectionsStatus.OK) {
                                directionsDisplay.setDirections(response);
                            } else {
                                window.alert('Directions request failed due to ' + status);
                            }
                        });

                    });
                }

                directionsDisplay.setMap(map);






            });
        })
 