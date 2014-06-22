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
    karma: {
      unit: {
        options: {
          frameworks: ['jasmine'],
          //All of the files that the app needs. The order is important --
          //many files depend on others.
          files: [
            "src/js/lib/jquery.min-1.9.0.js",
            "src/js/lib/**/jquery*.js",
            "src/js/lib/bootstrap.min.js",
            "src/js/lib/bootstrap-colorpicker-module.js",
            "src/js/lib/datatables/FixedColumns.js",
            "src/js/lib/d3.v3.min.js",
            "src/js/lib/vega-1.3.3.js",
            "src/js/lib/angular-1.2.10.min.js",
            "src/js/lib/angular-1.2.10-mocks.js",
            "src/js/lib/inflector.js",
            "src/js/lib/sortable.js",
            "src/js/lib/indexeddb.js",

            "src/js/app/vde.js",
            "src/js/app/**/*.js",

            "src/js/vis/Vis.js",
            "src/js/vis/iVis.js",
            "src/js/vis/Callback.js",
            "src/js/vis/Pipeline.js",
            "src/js/vis/Field.js",
            "src/js/vis/Mark.js",
            "src/js/vis/marks/Group.js",
            "src/js/vis/marks/Rect.js",
            "src/js/vis/marks/Symbol.js",
            "src/js/vis/marks/Arc.js",
            "src/js/vis/marks/Line.js",
            "src/js/vis/marks/Area.js",
            "src/js/vis/marks/Text.js",
            "src/js/vis/Scale.js",
            "src/js/vis/Axis.js",
            "src/js/vis/Transform.js",
            "src/js/vis/transforms/**/*.js",

            "tests/unit/**/*.js"
          ]
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
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['build', 'http-server:dev', 'protractor']);
  grunt.registerTask('build', ['less']);
  grunt.registerTask('serve', ['build', 'http-server:stay-open'])
};