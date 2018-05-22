import * as React from 'react';
import { LinkResult } from '../shared/linkDetails';

export interface LinkCreatedProps {
  link: LinkResult;
  dismiss: () => void;
}

export function LinkCreated({ link, dismiss }: LinkCreatedProps) {
  const url = 'https://putit.at/' + link.slug;
  const expiresDate = link.expires; // {{ ctrl.link.expires | date:'dd/MM/yyyy HH:mm'}}
  const friendlyTime = expiresDate; // moment.format()
  return <div className="c-result">
    <div className="c-result__row">
      <h2 className="c-result__header">New Link Created</h2>
    </div>
    <div className="c-result__row">
      <input className="c-result__link" type="text" id="createdLink" value={ url } />
      <button className="c-result__copyButton js-copy" data-clipboard-target="createdLink">Copy</button>
    </div>
    <div className="c-result__row">
      <a className="c-result__sourceLink" href={ link.url }>{ link.url }</a>
    </div>
    <div className="c-result__row">
      <p className="c-result__expiry">
        This link expires
        <span title={ 'Expiry: ' + expiresDate } className="c-result__time">{ friendlyTime }</span>.</p>
    </div>
    <button onClick={ dismiss } className="c-result__dismiss">Put another URL</button>
  </div>;
}
