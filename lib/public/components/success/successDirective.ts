/// <reference path='../_all.ts' />

import { LinkDetails } from '../../../shared/linkDetails';

export function successDirective(): angular.IDirective {
    return {
        scope: {
            links: '='
        },
        templateUrl: 'res/components/success/success.html',
        replace: true,
        controller: SuccessCtrl,
        controllerAs: 'ctrl'
    }
}

export interface SuccessScope extends angular.IScope {
    links?: LinkDetails[]
}

export class SuccessCtrl {

    public static $inject = [
        '$scope'
    ];

    constructor(private $scope: SuccessScope) {
    }

    public getLinkUrl(link: LinkDetails) {
        return 'http://putit.at/' + link.slug;
    }
}

