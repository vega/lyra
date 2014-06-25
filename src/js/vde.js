/* global jQuery */
var vde = {version: 1};

vde.App = angular.module('vde', ['ui.inflector', 'ui.sortable', 'xc.indexedDB', 'colorpicker.module'],
  function($compileProvider, $indexedDBProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(data|blob|https?|ftp|mailto|file):/);

    $indexedDBProvider
      .connection('lyraDB')
      .upgradeDatabase(vde.version, function(event, db){
        db.createObjectStore('files', {keyPath: 'fileName'});
      });
});