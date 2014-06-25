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
          singleRun: true,
          browsers: ['Chrome'],
          frameworks: ['jasmine'],
          //All of the files that the app needs. The order is important --
          //many files depend on others.
          files: [
            "src/js/lib/jquery.min-1.9.0.js",
            "src/js/lib/**/jquery*.js",
            "src/js/lib/bootstrap.min.js",
            "src/js/lib/datatables/FixedColumns.js",
            "src/js/lib/d3.v3.min.js",
            "src/js/lib/vega-1.3.3.js",
            "src/js/lib/angular-1.2.10.min.js",
            "src/js/lib/angular-1.2.12-mocks.js",
            "src/js/lib/bootstrap-colorpicker-module.js",
            "src/js/lib/inflector.js",
            "src/js/lib/sortable.js",
            "src/js/lib/indexeddb.js",

            "src/js/vde.js",
            "src/js/app.js",
            "src/js/vis.js",

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
    },
    jshint: {
      options: {
        jshintrc: true,
        force:true
      },
      dev: {
        src: ["src/js/app/**/*.js", "src/js/vis/**/*.js"]
      }
    },
    githooks: {
      all: {
        'pre-commit': 'build'
      }
    },
    concat: {
      app: {
        src: ['src/js/app/**/*.js'],
        dest: 'src/js/app.js'
      },
      vis: {
        // Order is important
        src: ['src/js/vis/Vis.js', 'src/js/vis/iVis.js', 'src/js/vis/Mark.js', 
          'src/js/vis/Transform.js', 'src/js/vis/marks/Symbol.js', 'src/js/vis/marks/Line.js', 
          'src/js/vis/**/*.js'],
        dest: 'src/js/vis.js'
      }
    },
    watch: {
      app: {
        files: ['src/js/app/**/*.js'],
        tasks: ['concat:app']
      },
      vis: {
        files: ['src/js/vis/**/*.js'],
        tasks: ['concat:vis']
      },
      less: {
        files: ['src/css/*.less'],
        tasks: ['less']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['build', 'http-server:dev', 'protractor', 'jshint:dev', 'karma']);
  grunt.registerTask('build', ['less', 'concat']);
  grunt.registerTask('serve', ['build', 'http-server:stay-open'])
};