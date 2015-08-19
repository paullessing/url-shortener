///<reference path='../_all.ts' />

module putitAt.form {
    export class FormService {
        public static $inject = [
            '$http'
        ];

        constructor(private $http: angular.IHttpService) {
        }

        public create(details: LinkDetails) {
            this.$http.post('/create', details).then(result => {
                console.log('Result', result.data);
            });
        }
    }
}
