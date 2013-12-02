module.exports = function(grunt) {

    grunt.initConfig({
        // running `grunt less` will compile once
        less: {
            development: {
                options: {
                    paths: ["./public/css"],
                    yuicompress: true
                },
                files: {
                    './public/css/site.css': './public/css/site.less'
                }
            }
        },
        // running `grunt watch` will watch for changes
        watch: {
            files: "./public/css/*.less",
            tasks: ['less']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
};