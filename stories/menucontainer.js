import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import MenuContainer from '../src/react-app/MenuContainer.jsx';
import Windows from '../src/react-app/Windows.jsx';
import { socket } from './defences.js';

export class MenuWindows extends React.Component {
    constructor(props) {
        super(props);
        this.windows = React.createRef();
        this.addWindow = this.addWindow.bind(this);
        this.removeWindow = this.removeWindow.bind(this);
    }

    addWindow(elem, key, callback) {
        this.windows.current.addWindow(elem, key, callback);
    }

    removeWindow(key) {
        this.windows.current.removeWindow(key);
    }

    render() {
        return (
            <div>
                <Windows ref={this.windows} />
                <MenuContainer
                    addWindow={this.addWindow}
                    removeWindow={this.removeWindow}
                    socket={socket}
                />
            </div>
        );
    }
}

storiesOf('MenuContainer', module)
    .addDecorator(StorybookConsole)
    .add('MenuContainer', () => <MenuContainer />)
    .add('MenuWindows', () => <MenuWindows />);
