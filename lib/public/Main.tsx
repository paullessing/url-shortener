import * as React from 'react';
import { LinkResult } from '../shared/linkDetails';
import { LinkCreated } from './LinkCreated';
import { LinkForm } from './LinkForm';

export interface State {
  lastCreatedLink: LinkResult | null;
}

export class Main extends React.Component<any, State> /* implements React.ComponentLifecycle<any, any> */ {

  constructor(props: any) {
    super(props);

    this.state = {
      lastCreatedLink: null
    };

    this.dismiss = this.dismiss.bind(this);
    this.submit = this.submit.bind(this);
  }

  // public componentDidMount(): void {
  // }
  //
  // public componentWillUnmount(): void {
  // }

  public dismiss(): void {
    this.setState({
      lastCreatedLink: null
    });
  }

  public submit({ url, slug, expiry }: { url: string, slug: string, expiry: number }): void {
    this.setState({
      lastCreatedLink: {
        url,
        slug,
        adminId: 'foobar',
        expires: new Date()
      }
    });
  }

  public render(): JSX.Element {
    return this.state.lastCreatedLink ?
      <LinkCreated dismiss={this.dismiss} link={this.state.lastCreatedLink}></LinkCreated> :
      <LinkForm submit={this.submit}></LinkForm>;
  }
}
