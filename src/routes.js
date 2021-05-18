import {json} from './store'
import {get} from 'svelte/store'
import Page from './SearchComponents/Page.svelte'
let routes = {};
const jVal = get(json);
for (const page of jVal['Page']) {
    routes[page['URI'] + '/:slot1?/:slot2?/:slot3?']  = Page;
}
export default routes
