'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('propo').
  component('propo', {
    templateUrl: 'propo/propo.template.html',
    controller:['$firebaseStorage','$http','Auth','message_by_dlg','$location','$q','$sce','$scope','$timeout','$element', '$mdSidenav','$mdDialog',"propos","message","raisons","propo",
      function PropoController($firebaseStorage,$http,Auth,message_by_dlg,$location,$q,$sce,$scope,$timeout,$element,$mdSidenav,$mdDialog,propos,message,raisons,propo) {
        var liste ={}
        var listeassoc=[]
        //Check Auth
        // any time auth state changes, add the user data to scope
        $scope.deleg;
        $scope.nodata = true;
        $scope.nodataAssoc=true;
        $scope.propos = ""
        $scope.proposAssocie=""
        $scope.raisons=[[]];
        $scope.idraison ="";
        $scope.dgcleuniq= $location.search().dgcleuniq;
        $scope.ectacleuniq = $location.search().ectacleuniq;

        if (!$scope.ectacleuniq || !$scope.dgcleuniq) {
          $scope.nodata = true;
          return;
        }

      //  $scope.dgcle = $location.search().dgcleuniq
        Auth.$onAuthStateChanged(function(firebaseUser) {
          if (firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            $scope.user = firebaseUser
            //Get propo
            getPropo($scope.ectacleuniq,$scope.dgcleuniq);
          } else {
            console.log("Signed out");
            $location.path("/auth");
          }
        });

         $scope.logout = function(ev){
           //$firebaseArray.$destroy();
           Auth.$signOut();
         }
         $element.find('input').on('keydown', function(ev) {
             ev.stopPropagation();
         });

         function getPropo(ectacleuniq,dgcleuniq){
           propo(ectacleuniq,dgcleuniq).$loaded(function(data) {
             if (!data.numeroPolice) {
               $scope.nodata = true;
             }else{
               $scope.nodata = false;
               $scope.propo = data;
               $scope.$digest ;
               //angular.forEach(data,function(val,key){
                 //getRaison(val.$id)
               //})
               propo(ectacleuniq,dgcleuniq).$watch(function(event,key){
                 getRaison(event.key);
               });

             }
           });
         } //end getPropos
         //bool pour la validation des Taches
         $scope.tabRaisonOk  = []
         function getRaison(id){
           raisons(id).$loaded(function(dataRaisons){
             $scope.raisons[id] = dataRaisons
             $scope.$digest;
             $scope.tabRaisonOk[id] = false

             //Watch if all raisons valide
             raisons(id).$watch(function(event) {
               var bok = true
               if (event.event =="child_changed"){
                   angular.forEach(dataRaisons,function(val,key){
                     if (!val.valide){
                       bok=false;
                     }
                   })
                   if (bok && !$scope.tabRaisonOk[id]){ //all raisons are ok
                     console.log("propo terminé")
                     $scope.tabRaisonOk[id] = true
                     //passer propo en inssaisisable
                     var indexPropo = searchIndex(id,$scope.propos)
                     if (indexPropo==null){ //Ca veut dire que c'est une propo associé
                       indexPropo = searchIndex(id,$scope.proposAssocie)
                       $scope.proposAssocie[indexPropo].nonSassisable = false
                       $scope.proposAssocie.$save(indexPropo).then(function(ref) {
                        console.log("Propo passé en saissisable")
                        //MAJ base HF passer la propo en saissisable
                        setPropo(id);
                      });
                     }else{
                       $scope.propos[indexPropo].nonSassisable = false
                       $scope.propos.$save(indexPropo).then(function(ref) {
                        console.log("Propo passé en saissisable")
                        //MAJ base HF passer la propo en saissisable
                        setPropo(id);
                     });

                   }
               }
             }
             });
           })
         }


         function searchIndex(nameKey, myArray){
            for (var i=0; i < myArray.length; i++) {
                if (myArray[i].$id === nameKey) {
                    return i;
                }
            }
            return null;
        }
          $scope.showAdvanced = function(ev,idRaison,idPropo,raison) {
            $scope.idraison = idRaison;
            var titre = raison.titreRaison;
             $mdDialog.show({
               controller: DialogController,
               templateUrl: 'propo/dialog.msg.html',
               parent: angular.element(document.body),
               targetEvent: ev,
               clickOutsideToClose : false,
               locals: {
                 idraison: $scope.idraison,
                 raison : raison,
                 idpropo : idPropo,
                 raisons : $scope.raisons,
                 user : $scope.user
               },
               fullscreen: true// Only for -xs, -sm breakpoints.
             })
             .then(function(answer) {
               $scope.status = 'You said the information was "' + answer + '".';
             }, function() {
               $scope.status = 'You cancelled the dialog.';
             });
           }; // End showAdvanced

           function DialogController($scope, $mdDialog,idraison,raison,user,raisons,idpropo,message_by_dlg) {
             $scope.chat= {}
             var messages = [];
             $scope.closeDialog=true;
             $scope.user = user; // connected user
             $scope.messages = message(idraison);
             $scope.trustAsHtml = $sce.trustAsHtml;
             $scope.titreRaison = raison.titreRaison;
             $scope.texteRaison = raison.texteRaison;
             var indexRaison = searchIndex(idraison,raisons[idpropo])
             $scope.raison = raisons[idpropo][indexRaison]
             $scope.cancel = function() {
               if ($scope.closeDialog){
                 $mdDialog.cancel();
               }else{
                 alert("Un des n'as pas pu être envoyé, veuillez attendre...")
               }

             };
           } // end DialogController
           $scope.selection = function(ev){
             console.log("Pas pu le selectionner")
           }

      }//End EspaceController
    ]
  }).
  filter('htmlize', ['$sce',function($sce) {
    return function(string) {
      return $sce.trustAsHtml(string.replace(/\n+?/g, '<br>'));
    };
  }])
  .filter('strReplace', function () {
    return function (input, from, to) {
      input = input || '';
      from = from || '';
      to = to || '';
      return input.replace(new RegExp(from, 'g'), to);
    };
  });
