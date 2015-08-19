///<reference path='_all.ts' />
///<reference path='components/form/formDirective.ts' />

//var form = require('./components/form/component');

namespace putitAt {
    var app = angular.module('putitAt', []);

    app.directive('putitAtForm', form.formDirective)
        .service('FormService', form.FormService);
}
