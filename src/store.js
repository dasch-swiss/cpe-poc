import {writable} from 'svelte/store';
import * as j from './ProjectJSON/test.json';

export const language = writable('en');
export const json = writable(j);

// token received from login and saved for further requests
export const token = writable(null);
// all lists of a specific project
export const lists = writable(null);
// ontologies of a specific project
export const ontologies = writable(null);
