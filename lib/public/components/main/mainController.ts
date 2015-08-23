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

    public lastLink: LinkDetails = null;
    public foo = { bar: 'baz' };
    public self: MainCtrl;

    public submit(linkDetails: LinkDetails) {
        // TODO when this is passed as a callback "this" is lost
        console.log("MainCtrl: Submitting", this);

        this.linkService.create(linkDetails).then(newLink => {
            this.$scope.$apply(() => {
                console.log("Updating lastLink:", this);
                console.log("Is it me?", this.self === this, this.self, this);
                this.lastLink = newLink;
                this.foo = { bar: 'bear' };
            })
        });
    }
}