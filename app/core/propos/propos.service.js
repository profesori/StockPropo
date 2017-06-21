'use strict';

angular.
  module('core.propos').
  factory('propos', ['$firebaseArray',
    function($firebaseArray) {
      return function(utcleuniq,dgcleuniq) {
       // create a reference to the database node where we will store our data
       var ref = firebase.database().ref("PROPO").child(dgcleuniq).orderByChild("nonSassisable").equalTo(true) ;
       // return it as a synchronized object
       return $firebaseArray(ref);
     };
    }
  ]).
  factory('proposAssocie', ['$firebaseArray',
    function($firebaseArray) {
      return function(utcleuniq) {
       // create a reference to the database node where we will store our data
       var ref = firebase.database().ref("REDACTEUR").child(utcleuniq).child("ASSOC").orderByChild("nonSassisable").equalTo(true) ;
       // return it as a synchronized object
       return $firebaseArray(ref);
     };
    }
  ]).
  factory('propoAssocie', ['$firebaseArray',
    function($firebaseArray) {
      return function(utcleuniq,ectacleuniq) {
       // create a reference to the database node where we will store our data
       var ref = firebase.database().ref("REDACTEUR").child(utcleuniq).child("ASSOC").child(ectacleuniq).orderByChild("nonSassisable").equalTo(true) ;
       // return it as a synchronized object
       return $firebaseArray(ref);
     };
    }
  ]).
  factory('propo', ['$firebaseObject',
    function($firebaseObject) {
      return function(ectacleuniq,dgcleuniq) {
       // create a reference to the database node where we will store our data
       var ref = firebase.database().ref("PROPO").child(parseInt(dgcleuniq)).child(parseInt(ectacleuniq));
       // return it as a synchronized object
       return $firebaseObject(ref);
     };
    }
  ])
