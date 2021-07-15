import {writable} from 'svelte/store';
import * as j from './ProjectJSON/test.json'; //Here the json for the app is imported. Adjust json here if you need to work with another one.

export const language = writable('en');
export const json = writable(j);

// token received from login and saved for further requests
export const token = writable(null);
// all lists of a specific project
export const lists = writable(null);
// ontologies of a specific project
export const ontologies = writable(null);
