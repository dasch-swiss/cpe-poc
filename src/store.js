import {writable} from 'svelte/store'
import * as j from './test.json'
export const language = writable('en');
export const json = writable(j);