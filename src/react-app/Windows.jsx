import React from 'react';
import Window from './Window.jsx';

export default class Windows extends React.Component {
    constructor(props) {
        super(props);

        this.createWindow = this.createWindow.bind(this);
        this.findKey = this.findKey.bind(this);
        this.bringToFront = this.bringToFront.bind(this);
        this.addWindow = this.addWindow.bind(this);
        this.removeWindow = this.removeWindow.bind(this);

        let windows = {};
        for (const child of props.children) {
            let { key, window } = this.createWindow(child);
            windows[key] = window;
        }

        this.state = {
            windows: windows,
            order: Object.keys(windows)
        };
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
                key.toString()
            ]
        });
    }

    createWindow(child) {
        let key = Math.random();
        let window = (
            <Window
                key={key}
                close={() => this.removeWindow(key)}
                onClick={() => this.bringToFront(key)}
            >
                {child}
            </Window>
        );
        return { key: key, window: window };
    }

    addWindow(child) {
        let { key, window } = this.createWindow(child);
        let windows = { ...this.state.windows };
        windows[key] = window;

        this.setState({
            windows: windows,
            order: [...this.state.order, key]
        });
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
            <div>
                <button
                    onClick={() => this.addWindow(<div> Hello </div>)}
                    style={{ float: 'right' }}
                >
                    {' '}
                    Add Window{' '}
                </button>
                {this.state.order.map((key) => this.state.windows[key])}
            </div>
        );
    }
}
