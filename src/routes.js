import Playground from './testing/Playground.svelte'
import SinglePropertySearch from './SearchComponents/SinglePropertySearch.svelte'
import Home from './testing/Home.svelte'
import * as json from './test.json'
import Page from './SearchComponents/Page.svelte'
let routes = {
    /* Testing Section */
    '/': Home,
    '/playground/:predefinedProp?/:predefinedVal?': Playground,
    '/single': SinglePropertySearch,

}
for (const page of json['Page']) {
    routes[page['URI'] + '/:predefForm?/:predefinedProp?/:predefinedVal?']  = Page;
}
export default routes