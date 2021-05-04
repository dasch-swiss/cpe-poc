import {json} from './store'
import {get} from 'svelte/store'
import Page from './SearchComponents/Page.svelte'
let routes = {};
const jVal = get(json);
for (const page of jVal['Page']) {
    routes[page['URI'] + '/:predefForm?/:predefinedProp?/:predefinedVal?']  = Page;
}
console.log(routes);
export default routes