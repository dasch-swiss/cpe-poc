import {writable} from 'svelte/store'
import * as j from './test.json'
export const language = writable('en');
export const json = writable(j);

// imports test data from wordweb project
import * as ww from './wordweb.json'
// makes data from wordweb available to the outside
export const ww_json = writable(ww);
// token received from login and saved for further requests
export const token = writable(null);
