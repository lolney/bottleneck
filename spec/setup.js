import { JSDOM } from 'jsdom';

export default function setup() {
    const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'http://localhost/'
    });
    const { window } = jsdom;

    function copyProps(src, target) {
        const props = Object.getOwnPropertyNames(src)
            .filter((prop) => typeof target[prop] === 'undefined')
            .reduce(
                (result, prop) => ({
                    ...result,
                    [prop]: Object.getOwnPropertyDescriptor(src, prop)
                }),
                {}
            );
        Object.defineProperties(target, props);
    }

    global.window = window;
    global.document = window.document;
    global.navigator = {
        userAgent: 'node.js',
        platform: 'linux', // This can be set to mac, windows, or linux
        appName: 'Microsoft Internet Explorer' // Be sure to define this as well
    };
    copyProps(window, global);
}
