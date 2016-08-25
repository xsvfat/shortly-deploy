module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['public/client/*.js'],
        dest: 'public/dist/built.js',
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      target: {
        files: {
          'public/dist/uglifiedJS.js': ['public/dist/built.js']
        }
      }
    },

    eslint: {
      options: {
        quiet: false
      },
      target: [
        'app/collections/*.js',
        'app/models/*.js',
        'app/*.js',
        'public/client/*.js',
        'lib/**/*.js'
      ]
    },

    cssmin: {
      target: {
        files: {
          'public/dist/output.css': ['public/style.css']
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/*/*.js',
          'public/lib/*/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      'git-push': {
        command: 'git push live master',
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    grunt.task.run([ 'nodemon', 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'setEnvDev',
    'eslint',
    'mochaTest',
  ]);

  grunt.registerTask('build', [
    'concat', 'uglify', 'cssmin', 'shell:git-push'
  ]);

  grunt.registerTask('setEnvProd', function() {
    process.env.NODE_ENV = 'prod';
  });

  grunt.registerTask('setEnvDev', function() {
    process.env.NODE_ENV = 'dev';
  });

  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
    // add your deploy tasks here
    'setEnvProd',
    'eslint',
   // 'mochaTest',
    'build',
    'upload'
  ]);

};
