var port = 8081;

// Instructions from https://scotch.io/tutorials/creating-a-single-page-todo-app-with-node-and-angular

// set up ========================
import express        = require('express');
import mongoose       = require('mongoose'); // mongoose for mongodb
import morgan         = require('morgan'); // log requests to the console (express4)
import bodyParser     = require('body-parser'); // pull information from HTML POST (express4)
import methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var app               = express();                  // create our app w/ express

import { LinkDetails } from './lib/shared/linkDetails';
import * as linkService from './lib/system/linkService';

mongoose.connect('mongodb://localhost:27017/putit_at');

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended': true }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override'));

app.get('/:slug', (req: express.Request, res: express.Response) => {
    linkService.get(req.params.slug, true).then(link => {
        res.redirect(link.url, 302);
    }, err => {
        console.error(err);
        res.redirect("/");
    })
});

app.post('/create', (req: express.Request, res: express.Response) => {
    var details: LinkDetails = req.body;

    linkService.create(details).then(link => {
        console.log("Created", link);
        res.json({ success: true, link: link });
    }).catch(error => {
        console.log("Rejected: ", error);
        res.send({ success: false, error: error.message }); // TODO
    });
});

app.listen(port);
console.log("App listening on port " + port);
