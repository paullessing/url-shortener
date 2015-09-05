/// <reference path='../_all.ts' />

import { LinkDetails } from '../../../shared/linkDetails';
import { LinkService } from '../../util/linkService';

export class MainCtrl {
    public static $inject = [
        '$scope',
        'LinkService'
    ];
    constructor(private $scope: angular.IScope,
                private linkService: LinkService
    ) {
        this.linkService.addObserver({
            onCreate: function(link: LinkDetails) {
                console.log('MainCtrl: link has changed!', link);
            }
        });
        console.log("MainCtrl: Created", this);

        this.self = this;
    }

    public lastCreatedLink: LinkDetails = null;
    public self: MainCtrl;

    public submit(linkDetails: LinkDetails): Promise<LinkDetails> {
        return this.linkService.create(linkDetails).then(newLink => {
            this.$scope.$apply(() => {
                this.lastCreatedLink = newLink;
            });
            return newLink;
        });
    }

    public dismiss() {
        this.lastCreatedLink = null;
    }
}