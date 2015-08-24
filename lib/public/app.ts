///<reference path='_all.ts' />
///<reference path='components/form/formDirective.ts' />
///<reference path='components/success/successDirective.ts' />

// Remove before prod release
//require('jquery');
//require('angularjs');
//require('angular-material');
//require('angular-aria');
//require('angular-animate');

import { formDirective } from './components/form/formDirective';
import { successDirective } from './components/success/successDirective';
import { MainCtrl } from './components/main/mainController';
import { LinkService } from './util/linkService';

var app = angular.module('putitAt', ['ngMaterial']);

app.directive('putitAtForm', formDirective)
    .directive('putitAtSuccess', successDirective)
    .controller('MainCtrl', MainCtrl)
    .service('LinkService', LinkService);