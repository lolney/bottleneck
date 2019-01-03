import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Windows from '../../src/react-app/Windows';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
process.env.NODE_ENV = 'test';

describe('Windows', () => {
    let windows;
    const key = 99;

    let add = (elem, key) => {
        windows.instance().addWindow(elem, key);
        windows.update();
    };

    let remove = (key) => {
        windows.instance().removeWindow(key);
        windows.update();
    };

    let bringToFront = (key) => {
        windows.instance().bringToFront(key);
        windows.update();
    };

    beforeEach(() => {
        windows = mount(<Windows />);

        add(<form />, key);
    });

    afterEach(() => {
        windows.unmount();
    });

    it('addWindow adds to the end of order', () => {
        expect(windows.contains(<form />)).toEqual(true);
        expect(Object.keys(windows.state('windows')).length).toEqual(1);
        expect(windows.state('order')[0]).toEqual(key);

        add(<span />, 100);

        expect(windows.contains(<span />)).toEqual(true);
        expect(Object.keys(windows.state('windows')).length).toEqual(2);
        expect(windows.state('order')[1]).toEqual(100);
    });

    it('removeWindow maintains order', () => {
        add(<span />, 100);
        add(<span />, 101);
        remove(100);

        expect(windows.state('order')[0]).toEqual(key);
        expect(windows.state('order')[1]).toEqual(101);

        add(<span />, 100);
        remove(100);

        expect(windows.state('order')[0]).toEqual(key);
        expect(windows.state('order')[1]).toEqual(101);

        add(<span />, 100);
        remove(key);

        expect(windows.state('order')[0]).toEqual(101);
        expect(windows.state('order')[1]).toEqual(100);
        expect(Object.keys(windows.state('windows')).length).toEqual(2);
    });

    it('bringToFront maintains order, apart from the element brought to front', () => {
        add(<span />, 100);
        add(<span />, 101);
        add(<span />, 102);

        bringToFront(100);

        expect(windows.state('order')).toEqual([key, 101, 102, 100]);
    });

    it('attempting to remove a removed window throws an error', () => {
        remove(key);

        expect(windows.state('order').length).toEqual(0);
        expect(() => remove(key)).toThrow();
    });
});
