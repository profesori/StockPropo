'use strict';

angular.
  module('core.auth').
  factory("Auth", ["$firebaseAuth",
    function($firebaseAuth) {
      return $firebaseAuth();
    }
  ]).
  factory('delegue_from_dgcleuniq', ['$firebaseObject',
    function($firebaseObject) {
      return function(dgcleuniq) {
        // create a reference to the database node where we will store our data
        var ref = firebase.database().ref("DELEGUE");
        var delegueRef = ref.child(dgcleuniq)
        // return it as a synchronized object
        return $firebaseObject(delegueRef);
      }
    }
  ]).
  factory('delegue_from_email', ['$firebaseArray',
    function($firebaseArray) {
      return function(email) {
        // create a reference to the database node where we will store our data
        var ref = firebase.database().ref("DELEGUE");
        var delegueRef = ref.orderByChild("Email").equalTo(email)
        // return it as a synchronized object
        return $firebaseArray(delegueRef);
      }
    }
  ]).
  factory('redacteur_from_utcleuniq', ['$firebaseObject',
    function($firebaseObject) {
      return function(utcle) {
        // create a reference to the database node where we will store our data
        var ref = firebase.database().ref("REDACTEUR");
        var utilisatRef = ref.child(utcle);
        // return it as a synchronized object
        return $firebaseObject(utilisatRef);
      }
    }
  ]).
  factory('redacteur_from_email', ['$firebaseArray',
    function($firebaseArray) {
      return function(email) {
        // create a reference to the database node where we will store our data
        var ref = firebase.database().ref("REDACTEUR");
        var utilisatRef = ref.orderByChild("Email").equalTo(email)
        // return it as a synchronized object
        return $firebaseArray(utilisatRef);
      }
    }
  ]).
  factory('redacteur_en_conge', ['$firebaseArray',
    function($firebaseArray) {
      return function() {
        // create a reference to the database node where we will store our data
        var ref = firebase.database().ref("REDACTEUR");
        var utilisatRef = ref.orderByChild("enconge").equalTo(true)
        // return it as a synchronized object
        return $firebaseArray(utilisatRef);
      }
    }
  ]).
  factory('redacteurs', ['$firebaseArray',
    function($firebaseArray) {
      return function() {
        // create a reference to the database node where we will store our data
        var ref = firebase.database().ref("REDACTEUR");
      //  var utilisatRef = ref.orderByChild("enconge").equalTo(true)
        // return it as a synchronized object
        return $firebaseArray(ref);
      }
    }
  ]);
