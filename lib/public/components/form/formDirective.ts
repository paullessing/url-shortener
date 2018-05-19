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

export interface FormScope extends angular.IScope {
    create(details: { link: LinkDetails }): Promise<LinkDetails>;
}

export class FormCtrl {
    public static $inject = [
        '$scope'
    ];

    constructor(private $scope: FormScope) {
        this.reset();
    }

    public formData = <LinkDetails> null;

    public expiryOptions = [{
        value: 600,
        name: '10 minutes'
    },{
        value: 3600,
        name: '1 hour'
    },{
        value: 3600 * 12,
        name: '12 hours'
    },{
        value: 86400,
        name: '1 day'
    },{
        value: 86400 * 7,
        name: '1 week'
    },{
        value: 86400 * 30,
        name: '1 month'
    },{
        value: 86400 * 30 * 6,
        name: '6 months'
    },{
        value: 86400 * 365,
        name: '1 year'
    }];

    private reset() {
        this.formData = {
            url: '',
            slug: '',
            expiresSeconds: this.expiryOptions[0].value
        };
    }

    public submit() {
        this.$scope.create({link: this.formData}).then(result => {
            this.reset();
        }).catch(err => {
            // Show error in frontend;
        });
    }
}

