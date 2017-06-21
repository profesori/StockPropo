'use strict';

angular.
  module('core.raisons').
  factory('raisons', ['$firebaseArray',
    function($firebaseArray) {
      return function(propoID) {
       // create a reference to the database node where we will store our data
       var ref = firebase.database().ref("RAISON").child(propoID) ;
       // return it as a synchronized object
       return $firebaseArray(ref);
     };
    }
  ]);
