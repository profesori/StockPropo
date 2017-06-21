'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('auth').
  component('auth', {
    templateUrl: 'auth/auth.template.html',
    controller:['$location','$scope',"Auth",
      function AuthController($location,$scope,Auth) {
        $scope.loginUser = function(ev) {
           $scope.message = null;
           $scope.error = null;
           // Sign in user
           Auth.$signInWithEmailAndPassword($scope.user.email, $scope.user.password)
             .then(function(firebaseUser) {
                $location.path("/espace");
             }).catch(function(error) {
               $scope.error = error;
               alert(error);
             });
         };

         $scope.googleLogin = function(ev){
           $scope.authObj.$signInWithPopup("google").then(function(result) {
            console.log("Signed in as:", result.user.uid);
              $location.path("/escape");
          }).catch(function(error) {
            console.error("Authentication failed:", error);
            $scope.error = error;
          });
         }

      }
    ]
  });
