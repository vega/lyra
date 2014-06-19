module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    protractor: {
      options: {
        configFile: "node_modules/protractor/referenceConf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      dev: {
        options: {
          configFile: "tests.js", // Target-specific config file
          args: {} // Target-specific arguments
        }
      },
    },
    'http-server': {
      dev: {
        // the server root directory
        root: "src",

        port: 8080,
        host: "localhost",

        cache: 1,
        showDir : true,
        autoIndex: true,
        defaultExt: "html",

        // run in parallel with other tasks
        runInBackground: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-http-server');

  grunt.registerTask('test', ['http-server', 'protractor']);
};