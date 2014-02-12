/**
 * @license $indexedDBProvider
 * (c) 2013 Clemens Capitain (webcss)
 * License: MIT
 */

'use strict';
/** unify browser specific implementations */
var indexedDB = window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;
var IDBKeyRange=window.IDBKeyRange||window.mozIDBKeyRange||window.webkitIDBKeyRange||window.msIDBKeyRange;

angular.module('xc.indexedDB', []).provider('$indexedDB', function() {
  var module          = this,
      /** IDBTransaction mode constants */
          READONLY        = "readonly",
      READWRITE       = "readwrite",
      VERSIONCHANGE   = "versionchange",
      /** IDBCursor direction and skip behaviour constants */
          NEXT            = "next",
      NEXTUNIQUE      = "nextunique",
      PREV            = "prev",
      PREVUNIQUE      = "prevunique";

  /** predefined variables */
  module.dbName = '';
  module.dbVersion = 1;
  module.db = null;
  module.dbPromise = null;

  /** predefined callback functions, can be customized in angular.config */
  module.onTransactionComplete = function(e) {
    console.log('Transaction completed.');
  };
  module.onTransactionAbort = function(e) {
    console.log('Transaction aborted: '+ (e.target.webkitErrorMessage || e.target.error.message || e.target.errorCode));
  };
  module.onTransactionError = function(e) {
    console.log('Transaction failed: ' + e.target.errorCode);
  };
  module.onDatabaseError = function(e) {
    alert("Database error: " + (e.target.webkitErrorMessage || e.target.errorCode));
  };
  module.onDatabaseBlocked = function(e) {
    // If some other tab is loaded with the database, then it needs to be closed
    // before we can proceed.
    alert("Database is blocked. Try close other tabs with this page open and reload this page!");
  };

  /**
   * @ngdoc function
   * @name $indexedDBProvider.connection
   * @function
   *
   * @description
   * sets the name of the database to use
   *
   * @param {string} databaseName database name.
   * @returns {object} this
   */
  module.connection = function(databaseName) {
    module.dbName = databaseName;
    return this;
  };

  /**
   * @ngdoc function
   * @name $indexedDBProvider.upgradeDatabase
   * @function
   *
   * @description provides version number and steps to upgrade the database wrapped in a
   * callback function
   *
   * @param {number} newVersion new version number for the database.
   * @param {function} callback the callback which proceeds the upgrade
   * @returns {object} this
   */
  module.upgradeDatabase = function(newVersion, callback) {
    module.dbVersion = newVersion;
    module.upgradeCallback = callback;
    return this;
  };

  module.$get = ['$q', '$rootScope', function($q, $rootScope) {
    /**
     * @ngdoc object
     * @name defaultQueryOptions
     * @function
     *
     * @description optionally specify for cursor requests:
     * - which index to use
     * - a keyRange to apply
     * - the direction of traversal (bottom to top/top to bottom)
     */
    var defaultQueryOptions = {
      useIndex: undefined,
      keyRange: null,
      direction: NEXT
    };
    /**
     * @ngdoc object
     * @name dbPromise
     * @function
     *
     * @description open the database specified in $indexedDBProvider.connection and
     * $indexdDBProvider.upgradeDatabase and returns a promise for this connection
     * @params
     * @returns {object} promise $q.promise to fullfill connection
     */
    var dbPromise = function() {
      var dbReq, deferred;

      if (!module.dbPromise) {
        deferred = $q.defer();
        module.dbPromise = deferred.promise;

        dbReq = indexedDB.open(module.dbName, module.dbVersion || 1);
        dbReq.onsuccess = function(e) {
          module.db = dbReq.result;
          $rootScope.$apply(function(){
            deferred.resolve(module.db);
          });
        };
        dbReq.onblocked = module.onDatabaseBlocked;
        dbReq.onerror = module.onDatabaseError;
        dbReq.onupgradeneeded = function(e) {
          var db = e.target.result, tx = e.target.transaction;
          console.log('upgrading database "' + db.name + '" from version ' + e.oldVersion+
              ' to version ' + e.newVersion + '...');
          module.upgradeCallback && module.upgradeCallback(e, db, tx);
        };
      }

      return module.dbPromise;
    };
    /**
     * @ngdoc object
     * @name ObjectStore
     * @function
     *
     * @description wrapper for IDBObjectStore
     *
     * @params {string} storeName name of the objectstore
     */
    var ObjectStore = function(storeName) {
      this.storeName = storeName;
      this.transaction = undefined;
    };
    ObjectStore.prototype = {
      /**
       * @ngdoc method
       * @name ObjectStore.internalObjectStore
       * @function
       *
       * @description used internally to retrieve an objectstore
       * with the correct transaction mode
       *
       * @params {string} storeName name of the objectstore
       * @params {string} mode transaction mode to use for operation
       * @returns {object} IDBObjectStore the objectstore in question
       */
      internalObjectStore: function(storeName, mode) {
        var me = this;
        return dbPromise().then(function(db){
          me.transaction = db.transaction([storeName], mode || READONLY);
          me.transaction.oncomplete = module.onTransactionComplete;
          me.transaction.onabort = module.onTransactionAbort;
          me.onerror = module.onTransactionError;

          return me.transaction.objectStore(storeName);
        });
      },
      /**
       * @ngdoc method
       * @name ObjectStore.abort
       * @function
       *
       * @description abort the current transaction
       */
      "abort": function() {
        if (this.transaction) {
          this.transaction.abort();
        }
      },
      /**
       * @ngdoc method
       * @name ObjectStore.insert
       * @function
       *
       * @description wrapper for IDBObjectStore.add.
       * input data can be a single object or an array of objects for
       * bulk insertions within a single transaction
       *
       * @params {object or array} data the data to insert
       * @returns {object} $q.promise a promise on successfull execution
       */
      "insert": function(data){
        var d = $q.defer();
        return this.internalObjectStore(this.storeName, READWRITE).then(function(store){
          var req;
          if (angular.isArray(data)) {
            data.forEach(function(item){
              req = store.add(item);
              req.onsuccess = req.onerror = function(e) {
                $rootScope.$apply(function(){
                  d.resolve(e.target.result);
                });
              };
            });
          } else {
            req = store.add(data);
            req.onsuccess = req.onerror = function(e) {
              $rootScope.$apply(function(){
                d.resolve(e.target.result);
              });
            };
          }
          return d.promise;
        });
      },
      /**
       * @ngdoc method
       * @name ObjectStore.upsert
       * @function
       *
       * @description wrapper for IDBObjectStore.put.
       * modifies existing values or inserts as new value if nonexistant
       * input data can be a single object or an array of objects for
       * bulk updates/insertions within a single transaction
       *
       * @params {object or array} data the data to upsert
       * @returns {object} $q.promise a promise on successfull execution
       */
      "upsert": function(data){
        var d = $q.defer();
        return this.internalObjectStore(this.storeName, READWRITE).then(function(store){
          var req;
          if (angular.isArray(data)) {
            data.forEach(function(item){
              req = store.put(item);
              req.onsuccess = req.onerror = function(e) {
                $rootScope.$apply(function(){
                  d.resolve(e.target.result);
                });
              };
            });
          } else {
            req = store.put(data);
            req.onsuccess = req.onerror = function(e) {
              $rootScope.$apply(function(){
                d.resolve(e.target.result);
              });
            };
          }
          return d.promise;
        });
      },
      /**
       * @ngdoc method
       * @name ObjectStore.delete
       * @function
       *
       * @description wrapper for IDBObjectStore.delete.
       * deletes the value for the specified primary key
       *
       * @params {any value} key primary key to indetify a value
       * @returns {object} $q.promise a promise on successfull execution
       */
      "delete": function(key) {
        var d = $q.defer();
        return this.internalObjectStore(this.storeName, READWRITE).then(function(store){
          var req = store.delete(key);
          req.onsuccess = req.onerror = function(e) {
            $rootScope.$apply(function(){
              d.resolve(e.target.result);
            });
          };
          return d.promise;
        });
      },
      /**
       * @ngdoc method
       * @name ObjectStore.clear
       * @function
       *
       * @description wrapper for IDBObjectStore.clear.
       * removes all data in an objectstore
       *
       * @returns {object} $q.promise a promise on successfull execution
       */
      "clear": function() {
        var d = $q.defer();
        return this.internalObjectStore(this.storeName, READWRITE).then(function(store){
          var req = store.clear();
          req.onsuccess = req.onerror = function(e) {
            $rootScope.$apply(function(){
              d.resolve(e.target.result);
            });
          };
          return d.promise;
        });
      },
      /**
       * @ngdoc method
       * @name ObjectStore.count
       * @function
       *
       * @description wrapper for IDBObjectStore.count.
       * returns the number of values in the objectstore, as a promise
       *
       * @returns {object} $q.promise a promise on successfull execution
       */
      "count": function() {
        return this.internalObjectStore(this.storeName, READONLY).then(function(store){
          return store.count();
        });
      },
      /**
       * @ngdoc method
       * @name ObjectStore.find
       * @function
       *
       * @description wrapper for IDBObjectStore.get and IDBIndex.get.
       * retrieves a single value with specified key, or index-key
       *
       * @params {any value} keyOrIndex the key to value, or an indexName
       * @params {any value} key the key of an index (*optional*)
       * @returns {any value} value ...wrapped in a promise
       */
      "find": function(keyOrIndex, keyIfIndex){
        var d = $q.defer();
        var promise = d.promise;
        return this.internalObjectStore(this.storeName, READONLY).then(function(store){
          var req;

          if(keyIfIndex) {
            req = store.index(keyOrIndex).get(keyIfIndex);
          } else {
            req = store.get(keyOrIndex);
          }
          req.onsuccess = req.onerror = function(e) {
            $rootScope.$apply(function(){
              d.resolve(e.target.result);
            });
          };
          return promise;
        });
      },
      /**
       * @ngdoc method
       * @name ObjectStore.getAll
       * @function
       *
       * @description wrapper for IDBObjectStore.getAll (or shim).
       * retrieves all values from objectstore using IDBObjectStore.getAll
       * or a cursor request if getAll is not implemented
       *
       * @returns {array} values ...wrapped in a promise
       */
      "getAll": function() {
        var results = [], d = $q.defer();
        return this.internalObjectStore(this.storeName, READONLY).then(function(store){
          var req;
          if (store.getAll) {
            req = store.getAll();
            req.onsuccess = req.onerror = function(e) {
              $rootScope.$apply(function(){
                d.resolve(e.target.result);
              });
            };
          } else {
            req = store.openCursor();
            req.onsuccess = function(e) {
              var cursor = e.target.result;
              if(cursor){
                results.push(cursor.value);
                cursor.continue();
              } else {
                $rootScope.$apply(function(){
                  d.resolve(results);
                });
              }
            };
            req.onerror = function(e) {
              d.reject(e.target.result);
            };
          }
          return d.promise;
        });
      },
      /**
       * @ngdoc method
       * @name ObjectStore.each
       * @function
       *
       * @description wrapper for IDBObjectStore.openCursor or IDBIndex.openCursor.
       * returns an IDBCursor for further manipulation. See indexedDB documentation
       * for details on this.
       * https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB#Using_a_cursor
       *
       * @params {object} options optional query parameters, see defaultQueryOptions
       * and QueryBuilder for details
       * @returns {object} IDBCursor ...wrapped in a promise
       */
      "each": function(options){
        var d = $q.defer();
        return this.internalObjectStore(this.storeName, READWRITE).then(function(store){
          var req;
          options = options || defaultQueryOptions;
          if(options.useIndex) {
            req = store.index(options.useIndex).openCursor(options.keyRange, options.direction);
          } else {
            req = store.openCursor(options.keyRange, options.direction);
          }
          req.onsuccess = req.onerror = function(e) {
            $rootScope.$apply(function(){
              d.resolve(e.target.result);
            });
          };
          return d.promise;
        });
      }
    };

    /**
     * @ngdoc object
     * @name QueryBuilder
     * @function
     *
     * @description utility object to easily create IDBKeyRange for cursor queries
     */
    var QueryBuilder = function() {
      this.result = defaultQueryOptions;
    };
    QueryBuilder.prototype = {
      /**
       * @ngdoc method
       * @name QueryBuilder.$lt
       * @function
       *
       * @description set an upper bound, e.g. A < value, excluding value
       *
       * @params {any value} value bound value
       * @returns {object} this QueryBuilder, for chaining params
       */
      "$lt": function(value) {
        this.result.keyRange = IDBKeyRange.upperBound(value, true);
        return this;
      },
      /**
       * @ngdoc method
       * @name QueryBuilder.$gt
       * @function
       *
       * @description set a lower bound, e.g. A > value, excluding value
       *
       * @params {any value} value bound value
       * @returns {object} this QueryBuilder, for chaining params
       */
      "$gt": function(value) {
        this.result.keyRange = IDBKeyRange.lowerBound(value, true);
        return this;
      },
      /**
       * @ngdoc method
       * @name QueryBuilder.$lte
       * @function
       *
       * @description set an upper bound, e.g. A <= value, including value
       *
       * @params {any value} value bound value
       * @returns {object} this QueryBuilder, for chaining params
       */
      "$lte": function(value) {
        this.result.keyRange = IDBKeyRange.upperBound(value);
        return this;
      },
      /**
       * @ngdoc method
       * @name QueryBuilder.$gte
       * @function
       *
       * @description set an upper bound, e.g. A >= value, including value
       *
       * @params {any value} value bound value
       * @returns {object} this QueryBuilder, for chaining params
       */
      "$gte": function(value) {
        this.result.keyRange = IDBKeyRange.lowerBound(value);
        return this;
      },
      /**
       * @ngdoc method
       * @name QueryBuilder.$eq
       * @function
       *
       * @description exact match, e.g. A = value
       *
       * @params {any value} value bound value
       * @returns {object} this QueryBuilder, for chaining params
       */
      "$eq": function(value) {
        this.result.keyRange = IDBKeyRange.only(value);
        return this;
      },
      /**
       * @ngdoc method
       * @name QueryBuilder.$between
       * @function
       *
       * @description set an upper and lower bound, e.g. low >= value <= hi,
       * optionally including value
       *
       * @params {any value} lowValue lower bound value
       * @params {any value} hiValue upper bound value
       * @params {boolean} exLow optional, exclude lower bound value
       * @params {boolean} exHi optional, exclude upper bound value
       * @returns {object} this QueryBuilder, for chaining params
       */
      "$between": function(lowValue, hiValue, exLow, exHi) {
        this.result.keyRange = IDBKeyRange.bound(lowValue,hiValue,exLow||false,exHi||false);
        return this;
      },
      /**
       * @ngdoc method
       * @name QueryBuilder.$asc
       * @function
       *
       * @description set the direction of traversal to ascending (natural)
       *
       * @params {boolean} unique return only distinct values, skipping
       * duplicates (*optional*)
       * @returns {object} this QueryBuilder, for chaining params
       */
      "$asc": function(unique) {
        this.result.order = (unique)? NEXTUNIQUE: NEXT;
        return this;
      },
      /**
       * @ngdoc method
       * @name QueryBuilder.$desc
       * @function
       *
       * @description set the direction of traversal to descending order
       *
       * @params {boolean} unique return only distinct values, skipping
       * duplicates (*optional*)
       * @returns {object} this QueryBuilder, for chaining params
       */
      "$desc": function(unique) {
        this.result.order = (unique)? PREVUNIQUE: PREV;
        return this;
      },
      /**
       * @ngdoc method
       * @name QueryBuilder.$index
       * @function
       *
       * @description optionally specify an index to use
       *
       * @params {string} indexName index to use
       * @returns {object} this QueryBuilder, for chaining params
       */
      "$index": function(indexName) {
        this.result.useIndex = indexName;
        return this;
      },
      /**
       * @ngdoc method
       * @name QueryBuilder.compile
       * @function
       *
       * @description returns an object to be passed to ObjectStore.each
       * @returns {object} queryOptions
       */
      "compile": function() {
        return this.result;
      }
    };

    /**
     * @ngdoc angular.$provider
     * @name $indexedDB
     * @function
     *
     * @description indexedDB provider object
     */
    return {
      /**
       * @ngdoc method
       * @name $indexedDB.objectStore
       * @function
       *
       * @description an IDBObjectStore to use
       *
       * @params {string} storename the name of the objectstore to use
       * @returns {object} ObjectStore
       */
      "objectStore": function(storeName) {
        return new ObjectStore(storeName);
      },
      /**
       * @ngdoc method
       * @name $indexedDB.dbInfo
       * @function
       *
       * @description statistical information about the current database
       * - database name and version
       * - objectstores in in database with name, value count, keyPath,
       *   autoincrement flag and current assigned indices
       *
       * @returns {object} DBInfo
       */
      "dbInfo": function() {
        var storeNames, stores = [], tx, store;
        return dbPromise().then(function(db){
          storeNames = Array.prototype.slice.apply(db.objectStoreNames);
          tx = db.transaction(storeNames, READONLY);
          storeNames.forEach(function(storeName){
            store = tx.objectStore(storeName);
            stores.push({
              name: storeName,
              keyPath: store.keyPath,
              autoIncrement: store.autoIncrement,
              count: store.count(),
              indices: Array.prototype.slice.apply(store.indexNames)
            });
          });
          return {
            name: db.name,
            version: db.version,
            objectStores: stores
          };
        });
      },
      /**
       * @ngdoc method
       * @name $indexedDB.close
       * @function
       *
       * @description closes the current active database
       * @returns {object} this
       */
      "closeDB": function() {
        dbPromise().then(function(db){
          db.close();
        });

        module.db = null;
        module.dbPromise = null;

        return this;
      },
      /**
       * @ngdoc method
       * @name $indexedDB.switchDB
       * @function
       *
       * @description closes the current active database and opens another one
       *
       * @params {string} databaseName the name of the database to use
       * @params {number} version the version number of the database
       * @params {Function} upgradeCallBack the callback which proceeds the upgrade
       * @returns {object} this
       */
      "switchDB": function(databaseName, version, upgradeCallback) {
        this.closeDB();
        module.dbName = databaseName;
        module.dbVersion = version || 1;
        module.upgradeCallback = upgradeCallback || function() {};
        return this;
      },
      /**
       * @ngdoc method
       * @name $indexedDB.queryBuilder
       * @function
       *
       * @description provides access to the QueryBuilder utility
       *
       * @returns {object} QueryBuilder
       */
      "queryBuilder": function() {
        return new QueryBuilder();
      }
    };
  }];
});