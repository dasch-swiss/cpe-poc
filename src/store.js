import {writable} from 'svelte/store'
import * as j from './test.json'
export const language = writable('en');
export const json = writable(j);

// test data from project json for resource viewer
import * as data from './wordweb.json'
// makes data from a specific available to the outside
export const project_json = writable(data);
// token received from login and saved for further requests
export const token = writable(null);
// all lists of a specific project
export const lists = writable(null);
// ontologies of a specific project
export const ontologies = writable(null);
