///<reference path='_all.ts' />
///<reference path='components/form/formDirective.ts' />
///<reference path='components/success/successDirective.ts' />

namespace putitAt {
    var app = angular.module('putitAt', ['ngMaterial']);

    app.directive('putitAtForm', form.formDirective)
        .directive('putitAtSuccess', success.successDirective)
        .controller('MainCtrl', MainCtrl)
        .service('LinkService', LinkService);
}
