import React from 'react';
import Window from './Window.jsx';
import PropTypes from 'prop-types';
import Menu from './Menu.jsx';

export default class Windows extends React.Component {
    constructor(props) {
        super(props);

        this.offset = 0;

        this.createWindow = this.createWindow.bind(this);
        this.findKey = this.findKey.bind(this);
        this.bringToFront = this.bringToFront.bind(this);
        this.addWindow = this.addWindow.bind(this);
        this.removeWindow = this.removeWindow.bind(this);
        this.removeTop = this.removeTop.bind(this);
        this.getTopKey = this.getTopKey.bind(this);
        this.getTopOffset = this.getTopOffset.bind(this);

        this.addMenu = this.addMenu.bind(this);
        this.removeMenu = this.removeMenu.bind(this);
        this.addObject = this.addObject.bind(this);
        this.createMenu = this.createMenu.bind(this);

        let windows = {};
        if (props.children) {
            let children = props.children.length
                ? props.children
                : [props.children];
            for (const child of children) {
                let { key, window } = this.createWindow(child);
                windows[key] = window;
            }
        }

        this.state = {
            windows: windows,
            order: Object.keys(windows),
            callbacks: {}
        };
    }

    componentDidMount() {
        window.addEventListener('keydown', this.removeTop);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.removeTop);
    }

    removeTop(event) {
        if (event.code != 'Escape') return;

        let topKey = this.getTopKey(true);
        if (topKey != undefined) {
            this.removeWindow(topKey);
        }
    }

    findKey(key) {
        let i = this.state.order.findIndex((elem) => elem == key);
        if (i == -1) {
            throw new Error(`Could not find window key '${key}'`);
        }
        return i;
    }

    bringToFront(key) {
        let i = this.findKey(key);
        this.setState({
            order: [
                ...this.state.order.slice(0, i),
                ...this.state.order.slice(i + 1),
                key
            ]
        });
    }

    getTopKey(includeMenu = false) {
        let length = this.state.order.length;
        let top = this.state.order[length - 1];
        if (top === 'menu' && !includeMenu) {
            return this.state.order[length - 2];
        } else {
            return top;
        }
    }

    getTopOffset() {
        if (!this.state) {
            if (this.offset == undefined) this.offset = 0;
            return { x: (this.offset += 40) - 40, y: 0 };
        }
        let topKey = this.getTopKey();
        if (topKey == undefined) return { x: 0, y: 0 };

        let topOffset = this.state.windows[topKey].ref.current.getOffset();

        return { x: topOffset.x + 40, y: topOffset.y + 0 };
    }

    createWindow(child, key) {
        key = key != undefined ? key : Math.random();
        let ref = React.createRef();
        let window = (
            <Window
                key={key}
                ref={ref}
                offset={this.getTopOffset()}
                close={() => this.removeWindow(key)}
                onClick={() => this.bringToFront(key)}
            >
                {child}
            </Window>
        );
        return { key: key, window: window, ref: ref };
    }

    createMenu(socket) {
        return (
            <Menu
                key="menu"
                socket={socket}
                addWindow={this.addWindow}
                removeWindow={this.removeWindow}
                removeMenu={this.removeMenu}
            />
        );
    }

    addMenu(callback, socket) {
        if ('menu' in this.state.windows) return false;

        let menu = this.createMenu(socket);
        return this.addObject('menu', menu, callback);
    }

    removeMenu() {
        this.removeWindow('menu');
    }

    /**
     * Add a window that contains the element `child`
     * @param {React.Element} child
     * @param {*} userKey - optional - unique key used to identify the window
     * @param {*} callback  - optional - called when the window is removed
     */
    addWindow(child, userKey, callback) {
        if (userKey in this.state.windows || userKey === 'menu') return false;

        let { key, window } = this.createWindow(child, userKey);
        return this.addObject(key, window, callback);
    }

    addObject(key, object, callback) {
        let windows = { ...this.state.windows };
        windows[key] = object;

        let callbacks = { ...this.state.callbacks };
        if (callback) {
            callbacks[key] = callback;
        }

        this.setState({
            windows: windows,
            order: [...this.state.order, key],
            callbacks: callbacks
        });
        return true;
    }

    removeWindow(key) {
        let i = this.findKey(key);
        let windows = { ...this.state.windows };
        delete windows[key];

        let callbacks = { ...this.state.callbacks };
        if (callbacks[key]) {
            callbacks[key]();
            delete callbacks[key];
        }

        this.setState({
            windows: windows,
            order: [
                ...this.state.order.slice(0, i),
                ...this.state.order.slice(i + 1)
            ],
            callbacks: callbacks
        });
    }

    render() {
        return (
            <div>{this.state.order.map((key) => this.state.windows[key])}</div>
        );
    }
}

Windows.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element
    ])
};
