module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            web: {
                files: {
                    'public/assets/css/custom.css': 'less/custom.less'
                }
            }
        },

        watch: {
            web: {
                files: ['less/*.less'],
                tasks: ['less:web']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('all', ['less']);
};