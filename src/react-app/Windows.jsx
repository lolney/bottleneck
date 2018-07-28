import React from 'react';
import Window from './Window.jsx';
import PropTypes from 'prop-types';

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
            order: Object.keys(windows)
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

        let topKey = this.getTopKey();
        if (topKey != undefined) {
            this.removeWindow(topKey);
        }
    }

    findKey(key) {
        let i = this.state.order.findIndex((elem) => elem == key);
        if (i == undefined) {
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

    getTopKey() {
        let length = this.state.order.length;
        return this.state.order[length - 1];
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

    addWindow(child, userKey) {
        if (userKey in this.state.windows) return false;

        let { key, window } = this.createWindow(child, userKey);
        let windows = { ...this.state.windows };
        windows[key] = window;

        this.setState({
            windows: windows,
            order: [...this.state.order, key]
        });
        return true;
    }

    removeWindow(key) {
        let i = this.findKey(key);
        let windows = { ...this.state.windows };
        delete windows[key];

        this.setState({
            windows: windows,
            order: [
                ...this.state.order.slice(0, i),
                ...this.state.order.slice(i + 1)
            ]
        });
    }

    render() {
        return (
            <div>{this.state.order.map((key) => this.state.windows[key])}</div>
        );
    }
}

Windows.propTypes = {
    children: PropTypes.array
};
