import * as React from 'preact';

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

export class LinkForm extends React.Component<FormProps, FormState> implements React.ComponentLifecycle<any, any> {

  constructor() {
    super();

    this.state = EMPTY_FORM;
    this.updateUrl = this.updateUrl.bind(this);
    this.updateSlug = this.updateSlug.bind(this);
    this.updateExpiry = this.updateExpiry.bind(this);
    this.submit = this.submit.bind(this);
  }

  public updateUrl(event: Event): void {
    this.setState((state) => ({
      ...state,
      url: (event.target as HTMLInputElement).value || ''
    }));
  }

  public updateSlug(event: Event): void {
    this.setState((state) => ({
      ...state,
      slug: (event.target as HTMLInputElement) || ''
    }));
  }

  public updateExpiry(expiry: number): () => void {
    return () => this.setState((state) => ({
      ...state,
      expiry: Math.max(expiry, 0)
    }));
  }

  public submit = () => {
    this.props.submit(this.state);
  };

  public render(): JSX.Element {
    return <form onSubmit={this.submit} noValidate class="c-linkForm">
      <div class="c-linkForm__row">
        <input type="text" class="c-linkForm__link" value={this.state.url} onChange={this.updateUrl} placeholder="Paste your long URL here" />
        <button type="submit" class="c-linkForm__submit">Create Link</button>
      </div>
      <div class="c-linkForm__row">
        <div class="c-linkForm__inputBlock">
          <label class="c-linkForm__label" for="slug">
            Slug (Optional)
          </label>
          <input type="text" id="slug" value={this.state.slug} onChange={this.updateSlug} class="c-linkForm__slug" />
        </div>
        <div class="c-linkForm__inputBlock">
          <label class="c-linkForm__label">
            Expiry
          </label>
          <select ng-model="ctrl.formData.expiresSeconds" class="c-linkForm__expiry">
            {EXPIRY_OPTIONS.map(({name, value}) => <option value={'' + value} onChange={this.updateExpiry(value)}>{name}</option>)}
          </select>
        </div>
      </div>
      <pre><code>{this.state.url} - {this.state.slug} - {this.state.expiry}</code></pre> <!-- TODO This is debug code -->
    </form>;
  }
}