import React from 'react';
import ReactDOM from 'react-dom';
import { ENGINE_METHOD_DIGESTS } from 'constants';

import EditorSocketWatcher from './EditorSocketWatcher.jsx';
import ConnectionOverlay from './ConnectionOverlay.jsx';
import Login from './Login.jsx';
import HUD from './HUD.jsx';
import Game from './Game.jsx';
import Windows from './Windows.jsx';

import DefencesBrowser from './defences/DefencesBrowser.jsx';
import './CSS/Defences.scss';
import MenuContainer from './MenuContainer.jsx';

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
        this.removeWindow = this.removeWindow.bind(this);
    }

    addWindow(elem, key) {
        this.windows.current.addWindow(elem, key);
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
                <Windows ref={this.windows}>
                    <DefencesBrowser imageSrcs={['assets/sprites/tree1.png']} />
                </Windows>
                {this.state.socket && (
                    <MenuContainer
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
