///<reference path='../components/_all.ts' />

module putitAt {

    export interface LinkObserver {
        onCreate: (LinkDetails) => void
    };

    export class LinkService {
        public static $inject = [
            '$http'
        ];

        constructor(private $http: angular.IHttpService) {
        }

        private observers: LinkObserver[] = [];

        public create(details: LinkDetails): Promise<LinkDetails> {
            return Promise.resolve(
                this.$http.post('/create', details).then(result => {
                    var createdLink = <LinkDetails> result.data;
                    console.log('Result', createdLink);
                    this.notifyObservers(createdLink);
                    return createdLink;
                })
            );
        }

        public addObserver(observer: LinkObserver) {
            this.observers.push(observer);
        }

        private notifyObservers(link) {
            this.observers.forEach(observer => observer.onCreate(link));
        }
    }
}
