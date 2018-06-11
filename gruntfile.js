module.exports = function(grunt){

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '',
                footer: '',
                mangle:true
            },
            files: {
                expand:true,
                //src: ['www/dist/js/**/*.js','!www/dist/js/**/*.min.js','!www/dist/js/popbox-development.js'],
                src: ['js/revisions/**/*.js','!js/revisions/**/*.min.js'],
                rename:function(dst,src){
                    return src.replace('.js','.min.js');
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('scss', ['uglify']);

};