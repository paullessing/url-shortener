/// <reference path='../_all.ts' />

import { LinkDetails } from '../../../shared/linkDetails';
import * as moment from 'moment';

export function successDirective(): angular.IDirective {
    return {
        scope: {
            link: '=',
            dismiss: '&'
        },
        templateUrl: 'res/components/success/success.html',
        replace: true,
        controller: SuccessCtrl,
        controllerAs: 'ctrl',
        bindToController: true
    }
}

export class SuccessCtrl {

    public static $inject = [
    ];

    constructor() {
    }

    // Scope properties
    public link: LinkDetails;
    public dismiss: () => void;

    public getLinkUrl(link: LinkDetails) {
        return 'http://putit.at/' + link.slug;
    }

    public getFriendlyTime(time) {
        return moment(time).fromNow();
    }
}

