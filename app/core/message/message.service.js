'use strict';

angular.
  module('core.message').
  factory('message', ['$firebaseArray',
    function($firebaseArray) {
      return function(raisonID) {
       // create a reference to the database node where we will store our data
       var ref = firebase.database().ref("MESSAGES").child(raisonID) ;
       // return it as a synchronized object
       return $firebaseArray(ref);
     };
    }
  ]).
  factory('message_by_dlg', ['$firebaseArray',
    function($firebaseArray) {
      return function(raisonID,expediteur) {
       // create a reference to the database node where we will store our data
       var ref = firebase.database().ref("MESSAGES").child(raisonID).orderByChild("expediteur").equalTo(expediteur) ;;
       // return it as a synchronized object
       return $firebaseArray(ref);
     };
    }
  ]);
