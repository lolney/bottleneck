import React from 'react';
import ReactDOM from 'react-dom';
import { ENGINE_METHOD_DIGESTS } from 'constants';

import EditorSocketWatcher from './EditorSocketWatcher.jsx';
import ConnectionOverlay from './ConnectionOverlay.jsx';
import VictoryOverlay from './VictoryOverlay.jsx';
import Login from './Login.jsx';
import HUD from './HUD.jsx';
import Game from './Game.jsx';
import Windows from './Windows.jsx';

import DefencesBrowser from './defences/DefencesBrowser.jsx';

import './CSS/Defences.scss';
import './CSS/HUD.scss';
import './CSS/Defences.scss';
import './CSS/Solutions.scss';
import './CSS/Menu.scss';
import './CSS/MenuWindow.scss';
import './CSS/LoadingScreen.scss';
import './CSS/VictoryOverlay.scss';

/*
\ App
    \                            ^ Session token
     ?- not logged in -> Login --|
    \
     --> Socket
     ?- attempted login and not connected -> ConnectionOverlay
    \ WindowLayer
        \
         --> Socket
         ?- displaying problem -> Modal
                                \ Editor
    \ --> Socket
      HUD
       \ Menu
       \ ResourceCounts
    \ --> Token     ^ Socket
      Game ---------|

    - Create a wrapper class for the socket for better event management?
        - Might help with re-authenticating after disconnect
*/

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            token: true, // TODO: initialize as null and get from login
            socket: null
        };
        this.onReceiveToken = this.onReceiveToken.bind(this);
        this.onReceiveSocket = this.onReceiveSocket.bind(this);

        this.windows = React.createRef();
        this.addWindow = this.addWindow.bind(this);
        this.addMenu = this.addMenu.bind(this);
        this.removeMenu = this.removeMenu.bind(this);
        this.removeWindow = this.removeWindow.bind(this);
    }

    addWindow(elem, key, callback) {
        this.windows.current.addWindow(elem, key, callback);
    }

    addMenu(callback, socket) {
        this.windows.current.addMenu(callback, socket);
    }

    removeMenu() {
        this.windows.current.removeMenu();
    }

    removeWindow(key) {
        this.windows.current.removeWindow(key);
    }

    onReceiveToken(token) {
        this.setState({ token: token });
    }

    onReceiveSocket(socket) {
        new EditorSocketWatcher(socket, this.windows.current.addWindow);

        socket.addEventListener('authenticated', (event) => {
            this.setState({ socket: socket });
        });
    }

    render() {
        return (
            <div>
                {!this.state.token && (
                    <Login onReceiveToken={this.onReceiveToken} />
                )}
                {this.state.token && (
                    <ConnectionOverlay
                        key={this.state.socket == null}
                        socket={this.state.socket}
                    />
                )}
                <VictoryOverlay socket={this.state.socket} />
                <Windows ref={this.windows} />
                {this.state.socket && (
                    <HUD
                        addMenu={this.addMenu}
                        removeMenu={this.removeMenu}
                        addWindow={this.addWindow}
                        removeWindow={this.removeWindow}
                        socket={this.state.socket}
                    />
                )}
                {this.state.token && (
                    <Game
                        onReceiveSocket={this.onReceiveSocket}
                        token={this.state.token}
                    />
                )}
            </div>
        );
    }
}

export default function createApp() {
    window.addEventListener('DOMContentLoaded', () => {
        ReactDOM.render(<App />, document.getElementById('app'));
    });
}
