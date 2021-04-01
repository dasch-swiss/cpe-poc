import Playground from './Playground.svelte'

export default {
    '/': Playground,
    '/playground/:predefinedProp/:predefinedVal': Playground
}