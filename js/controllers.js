angular.module('app.controllers', [])

        .controller('AppCtrl', function ($scope, $localstorage, $ionicPopup) {
            $scope.base = 'http://mobitrash.cruxservers.in/operator/';

            $scope.isLogin = function () {
                /// Check user login status
                if ($localstorage.uid()) {
                    return true;
                } else {
                    return false;
                }
            }

            $scope.alert = function (title, message, type) {
                /// Show alert dialog
                var alertPopup = $ionicPopup.alert({
                    title: title,
                    template: message
                });
            };

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
                        $scope.alert('Login Error', 'Invalid ID');

                    }
                }, function errorCallback(response) {
                });
            }
        })

        .controller('scheduleForTheDayCtrl', function ($scope, $localstorage, $http, $ionicHistory) {
            $ionicHistory.clearHistory();
            $scope.schedules = {};
            $scope.pickupmessage = "";
            if ($localstorage.uid()) {
                $http({
                    url: $scope.base + 'schedules',
                    method: 'POST',
                    data: {id: $localstorage.uid()}
                }).then(function successCallback(response) {
                    if (response.data.flash == 'success') {
                        $scope.schedules = response.data.Schedules;
                        var index = 0;
                        $.each($scope.schedules, function (key, val) {
                            $.each(val.pickups, function (key1, val1) {
                                if (val1) {
                                    index++;
                                }
                            });
                        });
                        if (index == 0) {
                            $scope.pickupmessage = "No more pickups for today";
                        }
                    } else {
                        $scope.alert('Error Occured!', 'Error Occured! Please try again!');
                    }
                }, function errorCallback(response) {
                });
            }
        })

        .controller('cleaningCtrl', function ($scope, $state, $localstorage, $http, $ionicPopup) {
            $scope.cleaningDisabled = false;
            $scope.cleaning = false;
            $http({
                url: $scope.base + 'cleaning-data',
                method: 'POST',
                data: {id: $localstorage.uid()}
            }).then(function successCallback(response) {
                if (response.data.flash == 'success') {
                    if (response.data.Records > 0) {
                        $scope.cleaning = true;
                        $scope.cleaningDisabled = true;
                    }
                } else {
                    $scope.alert('Error Occured!', 'Error Occured! Please try again!');
                }
            }, function errorCallback(response) {
            });

            $scope.saveCleaning = function (cleaning) {
                if (cleaning) {
                    $scope.cleaningDisabled = true;

                    var Record = {};
                    Record.added_by = $localstorage.uid();
                    Record.recordtype_id = 3;
                    $http({
                        url: $scope.base + 'save-receipt-details',
                        method: 'POST',
                        data: Record
                    }).then(function successCallback(response) {
                        if (response.data.flash == 'success') {
                            $scope.alert('Success!', 'Data saved successfully!');
                            $state.go('markAttendance2.scheduleForTheDay');
                        } else {
                            $scope.alert('Error Occured!', 'Error Occured! Please try again!');
                        }
                    }, function errorCallback(response) {
                    });
                }
            };
        })

        .controller('receiptsCtrl', function ($scope, $state, $localstorage, $http, $ionicPopup) {
            $scope.receiptdata = {};
            $http({
                url: $scope.base + 'receipt-data',
                method: 'POST',
                data: {}
            }).then(function successCallback(response) {
                if (response.data.flash == 'success') {
                    $scope.receiptdata = response.data;
                } else {
                    $scope.alert('Error Occured!', 'Error Occured! Please try again!');
                }
            }, function errorCallback(response) {
            });

            $scope.saveReceipt = function (formdata) {
                formdata.Record.added_by = $localstorage.uid();
                $http({
                    url: $scope.base + 'save-receipt-details',
                    method: 'POST',
                    data: formdata.Record
                }).then(function successCallback(response) {
                    if (response.data.flash == 'success') {
                        $scope.alert('Success!', 'Data saved successfully!');
                        $state.go('markAttendance2.scheduleForTheDay');
                    } else {
                        $scope.alert('Error Occured!', 'Error Occured! Please try again!');
                    }
                }, function errorCallback(response) {
                });
            };

        })

        .controller('getClickedCtrl', function ($scope) {

            var objCanvas = document.getElementById("video");
            window.plugin.CanvasCamera.initialize(objCanvas);

        })

        .controller('pickupDetailsCtrl', function ($scope, $state, $http, $stateParams, $localstorage, Util) {
            $scope.wastetypes = {};
            $scope.pickup = {};
            $scope.additives = {};
            $scope.timerStartTime = $localstorage.get('timerStartTime');
            var startTime = new Date($localstorage.get('timerStartTime'));
            console.log(startTime);
            $scope.timerstartFormated = startTime.getHours()+':'+startTime.getMinutes()+':'+startTime.getSeconds();
            $http({
                url: $scope.base + 'pickup-details',
                method: 'POST',
                data: {id: $stateParams.pickupid}
            }).then(function successCallback(response) {
                if (response.data.flash == 'success') {
                    $scope.wastetypes = response.data.Wastetype;
                    $scope.additives = response.data.Additive;
                    $scope.pickup = response.data.Pickup;
                } else {
                    $scope.alert('Error Occured!', 'Error Occured! Please try again!');
                }
            }, function errorCallback(response) {
            });

            $scope.savePickup = function (formdata) {
                var startTime = new Date($localstorage.get('timerStartTime')).getTime();
                var timeNow = new Date().getTime();
                var timeTaken = Util.getTimeFormat(Math.floor(timeNow - startTime));
                formdata.Pickup.time_taken = timeTaken;
                formdata.Pickup.start_kilometer = $localstorage.get('startKilometer');
                $http({
                    url: $scope.base + 'save-service-details',
                    method: 'POST',
                    data: {service: formdata.Pickup, pickup: $scope.pickup}
                }).then(function successCallback(response) {
                    if (response.data.flash == 'success') {
                        $localstorage.delete('timerStartTime');
                        $localstorage.delete('startKilometer');
                        $scope.alert('Success!', 'Data saved successfully!');
                        $state.go('markAttendance2.scheduleForTheDay');
                    } else {
                        $scope.alert('Error Occured!', 'Error Occured! Please try again!');
                    }
                }, function errorCallback(response) {
                });
            };
        })

        .controller('startKilometerCtrl', function ($scope, $state, $stateParams, $localstorage) {
            $localstorage.delete('startKilometer');
            $scope.saveStartKM = function (formdata) {
                $localstorage.set('startKilometer', formdata.startkilometer);
                $state.go('markAttendance2.route', $stateParams);
            };
        })


        .controller('routeCtrl', function ($scope, $http, $state, $stateParams, $localstorage) {
            $scope.pickup = {};
            $http({
                url: $scope.base + 'pickup-details',
                method: 'POST',
                data: {id: $stateParams.pickupid}
            }).then(function successCallback(response) {
                if (response.data.flash == 'success') {
                    $scope.pickup = response.data.Pickup;
                } else {
                    $scope.alert('Error Occured!', 'Error Occured! Please try again!');
                }
            }, function errorCallback(response) {
            });

            $scope.startTimer = function () {
                var today = new Date();
                var startTime = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
                $localstorage.set('timerStartTime', startTime);
                $state.go('markAttendance2.pickupDetails', {pickupid: $stateParams.pickupid})
            }

            $scope.$on('$ionicView.afterEnter', function () {
                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 7

                });

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        var destination = new google.maps.LatLng($stateParams.latitude, $stateParams.longitude);
                        map.setCenter(initialLocation);
                        directionsService.route({
                            origin: initialLocation,
                            destination: destination,
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
 