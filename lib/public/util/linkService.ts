import { LinkDetails, LinkResult } from '../../shared/linkDetails';

export interface LinkObserver {
    onCreate(link: LinkDetails): void
};

export class LinkService {
    public static $inject = [
        '$http'
    ];

    constructor(private $http: angular.IHttpService) {
    }

    private observers: LinkObserver[] = [];

    public create(details: LinkDetails): Promise<LinkResult> {
        return Promise.resolve()
            .then(() => this.$http.post<LinkResult>('/create', details))
            .then((result: any) => {
                console.log("Got a response", result);
                if (!result.data.success) {
                    console.log("No success!");
                    return Promise.reject<LinkResult>(result.error);
                }
                var createdLink = result.data.link;
                console.log('Result', createdLink);
                this.notifyObservers(createdLink);
                return createdLink;
            }, httpErr => {
                console.warn("Http Error: ", httpErr);
                return Promise.reject<LinkResult>("An error has occurred. Please try again.");
            })
            .catch(err => {
                console.error("Failed to retrieve LinkDetails", err);
                return Promise.reject<LinkResult>(err);
            });
    }

    public addObserver(observer: LinkObserver) {
        this.observers.push(observer);
    }

    private notifyObservers(link: LinkDetails) {
        this.observers.forEach(observer => observer.onCreate(link));
    }
}
