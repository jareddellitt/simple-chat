(function (app) {

    app.directive('uploader', function () {
        return {
            restrict: 'AE',
            templateUrl: '/js-templates/uploader.html',
            scope: true,
            controller: ['$scope', '$element', function ($scope, $element) {
                Dropzone.options.fileUploader = {
                    paramName: 'file'
                };

                var dz = new Dropzone('#file-uploader', {
                    url: '/upload'
                });

                function leave(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    $element.removeClass('dragging');
                }

                $element.on('dragover', function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    $element.addClass('dragging');
                });

                $element.on('dragleave', leave);
            }]
        };
    });

}(app));