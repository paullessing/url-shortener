import * as React from 'react';
import { ChangeEvent } from 'react';

export interface FormProps {
  submit(data: { url: string, slug: string, expiry: number }): void;
}

interface FormState {
  url: string;
  slug: string;
  expiry: number;
}

const EMPTY_FORM: FormState = {
  url: '',
  slug: '',
  expiry: 0
};

const EXPIRY_OPTIONS = [{
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

// new ZeroClipboard($(element).find('.js-copy')); TODO

export class LinkForm extends React.Component<FormProps, FormState> /* implements React.ComponentLifecycle<any, any> */ {

  constructor(props: FormProps) {
    super(props);

    this.state = EMPTY_FORM;
    this.updateUrl = this.updateUrl.bind(this);
    this.updateSlug = this.updateSlug.bind(this);
    this.updateExpiry = this.updateExpiry.bind(this);
    this.submit = this.submit.bind(this);
  }

  public updateUrl(event: ChangeEvent<HTMLInputElement>): void {
    const url = event.target.value || '';
    this.setState((state) => ({
      ...state,
      url
    }));
  }

  public updateSlug(event: ChangeEvent<HTMLInputElement>): void {
    const slug = event.target.value || '';
    this.setState((state) => ({
      ...state,
      slug
    }));
  }

  public updateExpiry(event: ChangeEvent<HTMLSelectElement>): void {
    const expiry = Math.max(parseInt(event.target.value, 10), 0);
    this.setState((state) => ({
      ...state,
      expiry
    }));
  }

  public submit = () => {
    this.props.submit(this.state);
  };

  public render(): JSX.Element {
    return <form onSubmit={this.submit} noValidate className="c-linkForm">
      <div className="c-linkForm__row">
        <input type="text" className="c-linkForm__link" value={this.state.url} onChange={this.updateUrl} placeholder="Paste your long URL here" />
        <button type="submit" className="c-linkForm__submit">Create Link</button>
      </div>
      <div className="c-linkForm__row">
        <div className="c-linkForm__inputBlock">
          <label className="c-linkForm__label" htmlFor="slug">
            Slug (Optional)
          </label>
          <input type="text" id="slug" value={this.state.slug} onChange={this.updateSlug} className="c-linkForm__slug" />
        </div>
        <div className="c-linkForm__inputBlock">
          <label className="c-linkForm__label">
            Expiry
          </label>
          <select className="c-linkForm__expiry" onChange={this.updateExpiry}>
            {EXPIRY_OPTIONS.map(({name, value}) =>
              <option key={value} value={'' + value}>{name}</option>
            )}
          </select>
        </div>
      </div>
      <pre><code>{this.state.url} - {this.state.slug} - {this.state.expiry}</code></pre> { /* TODO This is debug code --> */ }
    </form>;
  }
}
