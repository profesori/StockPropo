angular
  .module("upload", [
    "firebase"
  ])
  .directive("fileUpload", FileUploadDirective);

function FileUploadDirective() {
  return {
    restrict: "E",
    transclude: true,
    scope: {
      onChange: "="
    },
    template: '<input style="display: none;" type="file" name="file" id="file-input" /><label for="file-input">  <md-icon><i class="material-icons">insert_drive_file</i></md-icon></label>',
    link: function (scope, element, attrs) {
      element.bind("change", function () {
        scope.onChange(element.children()[0].files);
      });
    }
  }
}
