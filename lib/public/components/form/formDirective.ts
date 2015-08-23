/// <reference path='../_all.ts' />

import { LinkDetails } from '../../../shared/linkDetails';

export function formDirective(): angular.IDirective {
    return {
        scope: {
            create: '&'
        },
        templateUrl: 'res/components/form/form.html',
        replace: true,
        controller: FormCtrl,
        controllerAs: 'ctrl'
    }
}

interface FormScope extends angular.IScope {
    create: (LinkDetails) => Promise<LinkDetails>;
}

export class FormCtrl {
    public static $inject = [
        '$scope'
    ];

    constructor(private $scope: FormScope) {
        this.reset();
    }

    public formData = <LinkDetails> null;

    private reset() {
        this.formData = {
            url: '',
            slug: '',
            expiry: ''
        };
    }

    public submit() {
        this.$scope.create({link: this.formData});
        this.reset();
    }
}

