import * as React from 'preact';
import { LinkResult } from '../shared/linkDetails';

export interface LinkCreatedProps {
  link: LinkResult;
  dismiss: () => void;
}

export function LinkCreated({ link, dismiss }: LinkCreatedProps) {
  const url = 'https://putit.at/' + link.slug;
  const expiresDate = link.expires; // {{ ctrl.link.expires | date:'dd/MM/yyyy HH:mm'}}
  const friendlyTime = expiresDate; // moment.format()
  return <div class="c-result">
    <div class="c-result__row">
      <h2 class="c-result__header">New Link Created</h2>
    </div>
    <div class="c-result__row">
      <input className="c-result__link" type="text" id="createdLink" value={ url } />
      <button class="c-result__copyButton js-copy" data-clipboard-target="createdLink">Copy</button>
    </div>
    <div class="c-result__row">
      <a class="c-result__sourceLink" href={ link.url }>{ link.url }</a>
    </div>
    <div class="c-result__row">
      <p class="c-result__expiry">
        This link expires
        <span title={ 'Expiry: ' + expiresDate } class="c-result__time">{ friendlyTime }</span>.</p>
    </div>
    <button onClick={ dismiss } class="c-result__dismiss">Put another URL</button>
  </div>;
}