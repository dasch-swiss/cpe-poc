/**
 * Defines the routes that are provided on the app. For each Page in the json, a route is created with 3 slots
 * to provide some parameters to the components
 */

import {json} from './store.js';
import {get} from 'svelte/store';
import Page from './SearchComponents/Page.svelte';

let routes = {};
const jVal = get(json);

for (const page of jVal['Page']) {
    routes[page['URI'] + '/:slot1?/:slot2?/:slot3?']  = Page;
}

export default routes
