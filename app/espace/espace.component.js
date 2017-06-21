'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('espace').
  component('espace', {
    templateUrl: 'espace/espace.template.html',
    controller:['$firebaseStorage','$http','Auth','proposAssocie','message_by_dlg','delegue_from_dgcleuniq','redacteur_en_conge','redacteurs','propoAssocie','delegue_from_email','redacteur_from_utcleuniq','redacteur_from_email','$location','$q','$sce','$scope','$timeout','$element', '$mdSidenav','$mdDialog',"propos","message","raisons",
      function EspaceController($firebaseStorage,$http,Auth,proposAssocie,message_by_dlg,delegue_from_dgcleuniq,redacteur_en_conge,redacteurs,propoAssocie,delegue_from_email,redacteur_from_utcleuniq,redacteur_from_email,$location,$q,$sce,$scope,$timeout,$element,$mdSidenav,$mdDialog,propos,message,raisons) {
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
         var guid=$location.search().gguid
        // $scope.isPiocelle = false;
      //  $scope.dgcle = $location.search().dgcleuniq
        Auth.$onAuthStateChanged(function(firebaseUser) {
          if (firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            $scope.user = firebaseUser
            var utilisateur = getUtilisateur(firebaseUser);
            utilisateur.then(function(res) {
              console.log('Success: ' + res);
              //test si redacteur afficher que les propos dlg, si dlg afficher que ces propos
              if (!$scope.isRedacteur){
                getPropos();
              }else{
                if ($scope.redacteur.ASSOC){
                  /*angular.forEach($scope.redacteur.associé,function(val,key){
                      var ProposAssoc = getPropo(val.dlg,val.propo);
                      ProposAssoc.then(function(res) {
                        console.log('Success: ' + res);
                        $scope.nodata = false;
                      }, function(reason) {
                        alert('Failed: ' + reason);
                      }, function(update) {
                      //  alert('Got notification: ' + update);
                      });
                  })*/
                  getProposAssocies()
                }
              }

            }, function(reason) {
              alert('Failed: ' + reason);
            }, function(update) {
            //  alert('Got notification: ' + update);
            });

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
         $scope.LISTE_DELEGUE={};
         function getUtilisateur(firebaseUser){
           var deferred = $q.defer();
           //Test if user or dlg
           redacteur_from_email(firebaseUser.email).$loaded(function(data) {

             if (!data[0]) {
               //Redacteur Pas Trouvé; test si c'est un délégué qui est connécté
               delegue_from_email(firebaseUser.email).$loaded(function(data2) {
                 if (!data2[0]) {
                   //on n'a trouvé personne
                   $scope.nodata = true;
                   deferred.reject("No Data");
                 }else{
                   $scope.delegue = data2[0];
                   $scope.user = data2[0];
                   $scope.isRedacteur = false;
                   redacteur_from_utcleuniq($scope.delegue.Redacteur).$loaded(function(ut) {
                     if (!ut) {
                       $scope.nodata = true;
                       deferred.reject("No Data");
                     }else{
                       $scope.redacteur = ut;
                       deferred.resolve("User Ok");
                     }
                   });
                 }
               });
             }else{
              $scope.redacteur = redacteur_from_utcleuniq(data[0].$id).$loaded(function(ut) {
                 if (!ut) {
                   $scope.nodata = true;
                   deferred.reject("No Data");
                 }else{
                   $scope.redacteur = ut;
                   $scope.user = data[0];
                   $scope.isRedacteur = true;
                   liste  = $scope.redacteur.DELEGUE

                  // $scope.ListeDlg = liste || {}
                  if ($scope.redacteur.Nom=="GPIOCELLE"){
                    $scope.isPiocelle = true;
                  }else{
                    $scope.isPiocelle = false;
                  }

                   //voir les délégué en congé
                   redacteur_en_conge().$loaded(function(res){
                     if (res.length==0){
                       $scope.LISTE_DELEGUE = liste
                     }else{
                       if ($scope.redacteur.Nom!="GPIOCELLE"){
                         angular.forEach(res,function(val){
                           $scope.LISTE_DELEGUE = angular.extend({},liste, val.DELEGUE)
                         })
                       }else{
                         $scope.LISTE_DELEGUE = liste;
                       }
                     }
                   })
                   $scope.$digest ;
                   deferred.resolve("User is Redacteur");
                 }
               });

             }
           });
           return deferred.promise;
         }

         $scope.redacteurEnConge=function(){
          //$scope.redacteur.DELEGUE=liste
           $scope.redacteur.$save();
         }

         function getProposAssocies(){
           proposAssocie($scope.redacteur.$id).$loaded(function(data) {
             if (data.length==0) {
               $scope.nodataAssoc = true;
             }else{
               $scope.nodataAssoc = false;
               $scope.proposAssocie = data

               $scope.$digest ;
               //angular.forEach(data,function(val,key){
                 //getRaison(val.$id)
               //})
               proposAssocie($scope.redacteur.$id).$watch(function(event,key){
                 getRaison(event.key);
               });

             }
           });
         }
         function getProposAssociesPourGP(idredac){
           var listeProposAssociés = [];
           redacteurs().$loaded(function(data) {
             angular.forEach(data,function(redac){
               if (redac.ASSOC){
                 angular.forEach(redac.ASSOC,function(assocs,key){
                   console.log(key+" "+redac.Nom);
                   var resDLG = $scope.delegue.Nom.split(" ");
                   if ((assocs.NomDelégue.trim() || assocs.delegue.trim() ) == resDLG[0] ){
                     assocs.$id = key
                     listeProposAssociés.push(assocs);
                     getRaison(key)
                     $scope.nodataAssoc = false;
                     $scope.proposAssocie = listeProposAssociés
                   }
                 })
               }
             })
           })

           /*
           proposAssocie(idredac).$loaded(function(data) {
             if (data.length==0) {
               $scope.nodataAssoc = true;
             }else{
               $scope.nodataAssoc = false;
               $scope.proposAssocie = data

               $scope.$digest ;
               //angular.forEach(data,function(val,key){
                 //getRaison(val.$id)
               //})
               proposAssocie($scope.redacteur.$id).$watch(function(event,key){
                 getRaison(event.key);
               });

             }
           });*/
         }

         function getPropos(){
           propos($scope.redacteur.$id,$scope.delegue.$id).$loaded(function(data) {
             if (data.length==0) {
               $scope.nodata = true;
             }else{
               $scope.nodata = false;
               $scope.propos = data
               $scope.$digest ;
               //angular.forEach(data,function(val,key){
                 //getRaison(val.$id)
               //})
               propos($scope.redacteur.$id,$scope.delegue.$id).$watch(function(event,key){
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
         function setPropo(id){
           var dataScript = {
             idPropo : id
           }
           var req = {
              method: 'POST',
              url: 'http://extranet.mudetaf.fr/mdtinter/setPropo.wss',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              transformRequest: function(obj) {
                 var str = [];
                 for(var p in obj)
                 str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                 return str.join("&");
             },
              data: dataScript
           }

           $http(req).then(function(res){
             console.log(res);
           }, function(err){
             console.log(err);
           });
         }
         function searchIndex(nameKey, myArray){
            for (var i=0; i < myArray.length; i++) {
                if (myArray[i].$id === nameKey) {
                    return i;
                }
            }
            return null;
        }
         //Delegue combo
         $scope.selectDelegue = function() {
            if ($scope.deleg !== undefined) {
              $scope.nodataAssoc = true;
              $scope.proposAssocie = ""
              $scope.delegue = $scope.LISTE_DELEGUE[$scope.deleg]
              $scope.delegue.$id = $scope.deleg
              getPropos();
              if ($scope.isPiocelle){
                getProposAssociesPourGP($scope.delegue.Redacteur)
              }
              return $scope.LISTE_DELEGUE[$scope.deleg].Nom;
            }else {
              $scope.nodata = true;
              return "Choisir le délégué ";
            }
          };
          //Handle PopUp
          $scope.showAdvanced = function(ev,idRaison,idPropo,raison) {
            $scope.idraison = idRaison;

            if ($scope.isRedacteur){
              $scope.expediteur = $scope.redacteur.Nom
            }else{
              $scope.expediteur = $scope.delegue.Nom
            }
            var titre = raison.titreRaison;
             $mdDialog.show({
               controller: DialogController,
               templateUrl: 'espace/dialog1.tmpl.html',
               parent: angular.element(document.body),
               targetEvent: ev,
               clickOutsideToClose : false,
               locals: {
                 idraison: $scope.idraison,
                 redacteur: $scope.redacteur.Nom,
                 delegue :"",
                 expediteur : $scope.expediteur,
                 isRedacteur : $scope.isRedacteur,
                 isPiocelle : $scope.isPiocelle,
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

           function DialogController($scope, $mdDialog,idraison,redacteur,delegue,expediteur,isRedacteur,isPiocelle,raison,user,raisons,idpropo,message_by_dlg) {
             $scope.chat= {}
             var messages = [];
             $scope.closeDialog=true;
             $scope.user = user; // connected user
             $scope.messages = message(idraison);
             $scope.trustAsHtml = $sce.trustAsHtml;
             $scope.titreRaison = raison.titreRaison;
             $scope.texteRaison = raison.texteRaison;
             $scope.chat.delegue = delegue;
             $scope.chat.redacteur = redacteur;
             var indexRaison = searchIndex(idraison,raisons[idpropo])
             $scope.raison = raisons[idpropo][indexRaison]

     //========================Mettre à jour (=0) bdlg_new quand redacteur accede dans la fiche ou bdrdc=0 quand délégue si pas Piocelle
             if (!isPiocelle){
               var dataScript = {
                 idraison : idraison,
                 champs : (isRedacteur ? 'bdlg_new' : 'brdct_new')
               }
               var req = {
                  method: 'POST',
                  url: 'http://extranet.mudetaf.fr/mdtinter/setChatVu.wss',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  transformRequest: function(obj) {
                     var str = [];
                     for(var p in obj)
                     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                     return str.join("&");
                 },
                  data: dataScript
               }

               $http(req).then(function(res){
                 console.log(res);
                 if (isRedacteur){
                   $scope.raison.bdlg_new = false
                 }else{
                   $scope.raison.brdct_new = false
                 }
                 raisons[idpropo].$save(indexRaison);
               }, function(err){
                 console.log(err);
               });
             }
    //=================================================================================
             $scope.AddMessage = function(ev){
               if ($scope.chat.message != "") {
                 var msg = {
                   message : $scope.chat.message,
                   expediteur : expediteur,
                   redacteur : isRedacteur,
                   time : firebase.database.ServerValue.TIMESTAMP,
                   isImage:false,
                   isPDF:false
                 }
                  $scope.messages.$add(msg).then(function(ref) {
                    var id = ref.key;
                    console.log("added record with id " + id);
                    if (!isRedacteur)
                    message_by_dlg(idraison,expediteur).$loaded(function(data){
                      if (data.length == 1) {
                        console.log("Premiere réponse du délégué")
                        //========================Maj base HF avec la data de la première réponse du délégué

                        var dataScript = {
                          idraison : idraison,
                        }
                        var req = {
                           method: 'POST',
                           url: 'http://extranet.mudetaf.fr/mdtinter/setDateReponseDelegue.wss',
                           headers: {
                             'Content-Type': 'application/x-www-form-urlencoded'
                           },
                           transformRequest: function(obj) {
                              var str = [];
                              for(var p in obj)
                              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                              return str.join("&");
                          },
                           data: dataScript
                        }
                        $http(req).then(function(res){
                          console.log("Maj date OK");
                        }, function(err){
                          console.log(err);
                        });
                       //=================================================================================
                      }
                    })
                    $scope.messages.$indexFor(id); // returns location in the array
                  });
                  $scope.chat.message=""


                  //========================Mettre à jour (=1) brdct_new quand redacteur accede dans la fiche ou bdrdc=0 quand délégue

                  var dataScript = {
                    idraison : idraison,
                    champs : (isRedacteur ? 'brdct_new' : 'bdlg_new')
                  }
                  var req = {
                     method: 'POST',
                     url: 'http://extranet.mudetaf.fr/mdtinter/setChatNew.wss',
                     headers: {
                       'Content-Type': 'application/x-www-form-urlencoded'
                     },
                     transformRequest: function(obj) {
                        var str = [];
                        for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                     data: dataScript
                  }

                  $http(req).then(function(res){
                    console.log(res);
                    if (isRedacteur){
                      $scope.raison.brdct_new = true
                    }else{
                      $scope.raison.bdlg_new = true
                    }
                    raisons[idpropo].$save(indexRaison);
                  }, function(err){
                    console.log(err);
                  });
                 //=================================================================================
               }
             }


               $scope.fileToUpload = null;
               $scope.onChange = function onChange(fileList) {
                 $scope.fileToUpload = fileList[0];

                 var msg = {
                   message : "",
                   expediteur : expediteur,
                   redacteur : isRedacteur,
                   time : firebase.database.ServerValue.TIMESTAMP,
                   isImage : true,
                   isPDF : !$scope.fileToUpload.type.match('image.*')
                 }
                  $scope.messages.$add(msg).then(function(ref) {
                    var id = ref.key;
                    console.log("added record with id " + id);
                    var indexMessage = $scope.messages.$indexFor(id); // returns location in the array
                    var storageRef = firebase.storage().ref("MESSAGE/"+id);
                    var storage = $firebaseStorage(storageRef);
                    var uploadTask = storage.$put( $scope.fileToUpload);
                    $scope.determinateValue = 0
                    uploadTask.$complete(function(snapshot) {
                      console.log(snapshot.downloadURL);
                      $scope.messages[indexMessage].message = snapshot.downloadURL;
                      $scope.messages.$save(indexMessage);
                      $scope.closeDialog = true;
                    });
                    uploadTask.$progress(function(snapshot) {
                      $scope.closeDialog = false;
                      var percentUploaded = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      $scope.determinateValue =percentUploaded
                      console.log(percentUploaded);
                    });
                  });
                  $scope.chat.message=""
                  //========================Mettre à jour (=1) brdct_new quand redacteur accede dans la fiche ou bdrdc=0 quand délégue

                  var dataScript = {
                    idraison : idraison,
                    champs : (isRedacteur ? 'brdct_new' : 'bdlg_new')
                  }
                  var req = {
                     method: 'POST',
                     url: 'http://extranet.mudetaf.fr/mdtinter/setChatNew.wss',
                     headers: {
                       'Content-Type': 'application/x-www-form-urlencoded'
                     },
                     transformRequest: function(obj) {
                        var str = [];
                        for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                     data: dataScript
                  }

                  $http(req).then(function(res){
                    console.log(res);
                    if (isRedacteur){
                      $scope.raison.brdct_new = true
                    }else{
                      $scope.raison.bdlg_new = true
                    }
                    raisons[idpropo].$save(indexRaison);
                  }, function(err){
                    console.log(err);
                  });
                 //=================================================================================

               };

             $scope.cancel = function() {
               if ($scope.closeDialog){
                 $mdDialog.cancel();
               }else{
                 alert("Un des n'as pas pu être envoyé, veuillez attendre...")
               }

             };
           } // end DialogController

           //Confirm dialogue
           //Avant : raisons[propo.$id].$save(raison)
           $scope.showConfirm = function(ev,id,obj,type) {

             var question  = "";
             if (!obj.valide){
               question = "Voulez vous dévalider la raison ?"
             }else{
               question = "Voulez vous valider la raison ?"
             }
             var etat = obj.valide;
              var confirm = $mdDialog.confirm()
                    .title(question)
                    .textContent('')
                    .ariaLabel('Question')
                    .targetEvent(ev)
                    .ok('Oui')
                    .cancel('Non');

              $mdDialog.show(confirm).then(function() {
                $scope.raisons[id].$save(obj)

                var dataScript = {
                  idraison : obj.$id,
                  valRaison : (obj.valide ? '1' : '0')
                }
                var req = {
                   method: 'POST',
                   url: 'http://extranet.mudetaf.fr/mdtinter/setRaison.wss',
                   headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                   },
                   transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
                  },
                   data: dataScript
                }

                $http(req).then(function(res){
                  console.log(res);
                }, function(err){
                  console.log(err);
                });

              }, function() {
                 obj.valide= !etat || false
              });
            };

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
