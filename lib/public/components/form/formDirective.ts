/// <reference path='../_all.ts' />
/// <reference path='./formService.ts' />

namespace putitAt.form {
    export function formDirective(): angular.IDirective {
        return {
            scope: {},
            templateUrl: 'res/components/form/form.html',
            replace: true,
            controller: FormCtrl,
            controllerAs: 'ctrl'
        }
    }

    export class FormCtrl {
        public static $inject = [
            'FormService'
        ];

        constructor(private formService: FormService) {
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
            console.log("Form data: ", this.formData);
            this.formService.create(this.formData);
            this.reset();
        }
    }
}

