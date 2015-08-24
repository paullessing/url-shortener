/// <reference path='../_all.ts' />

import { LinkDetails } from '../../../shared/linkDetails';

export function successDirective(): angular.IDirective {
    return {
        scope: {
            link: '='
        },
        templateUrl: 'res/components/success/success.html',
        replace: true,
        controller: SuccessCtrl,
        controllerAs: 'ctrl'
    }
}

export interface SuccessScope extends angular.IScope {
    link?: LinkDetails
}

export class SuccessCtrl {

    public static $inject = [
        '$scope'
    ];

    constructor(private $scope: SuccessScope) {
    }

    public getLinkUrl() {
        return 'http://putit.at/' + (this.$scope.link  ? this.$scope.link.slug : '404');
    }
}

