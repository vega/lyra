module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      options: {
        paths: "src/css",
      },
      dev: {
        files: {
          "src/css/vde.css": "src/css/vde.less"
        }
      }
    },

    protractor: {
      options: {
        configFile: "tests.js", // Default config file
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
      },
      'stay-open': {
        root: "src",
        port: 8080,
        host: 'localhost',

        cache: 1,
        showDir: true,
        autoIndex: true,
        defaultExt: "html",

        runInBackground: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-http-server');

  grunt.registerTask('test', ['build', 'http-server:dev', 'protractor']);
  grunt.registerTask('build', ['less']);
  grunt.registerTask('serve', ['build', 'http-server:stay-open'])
};