/// <reference path='../_all.ts' />

import { LinkResult } from '../../../shared/linkDetails';
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
        bindToController: true,
        link: function(scope, element) {
            console.log($(element), $(element).find('.js-copy'));
            new ZeroClipboard($(element).find('.js-copy'));
        }
    }
}

export class SuccessCtrl {

    public static $inject = [
    ];

    constructor() {
    }

    // Scope properties
    public link: LinkResult;
    public dismiss: () => void;

    public getLinkUrl() {
        return 'http://putit.at/' + this.link.slug;
    }

    public getFriendlyTime() {
        return moment(this.link.expires).fromNow();
    }
}

