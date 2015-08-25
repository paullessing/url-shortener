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

    public createdLinks: LinkDetails[] = [];
    public foo = { bar: 'baz' };
    public self: MainCtrl;

    public submit(linkDetails: LinkDetails) {
        this.linkService.create(linkDetails).then(newLink => {
            this.$scope.$apply(() => {
                this.createdLinks.push(newLink);
            })
        });
    }
}