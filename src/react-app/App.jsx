import React from 'react';
import ReactDOM from 'react-dom';

import EditorSocketWatcher from './EditorSocketWatcher.jsx';
import ConnectionOverlay from './ConnectionOverlay.jsx';
import VictoryOverlay from './VictoryOverlay.jsx';
import HUD from './HUD.jsx';
import HealthBarContainer from './HealthBarContainer.jsx';
import Game from './Game.jsx';
import Windows from './Windows.jsx';
import SocketContext from './SocketContext';
import ModeSelect from './modeSelect/App.jsx';
import withLogin from './login/withLogin.jsx';
import Tutorial from './tutorial/Tutorial.jsx';

import { Provider } from 'react-alert';

import './CSS/Defenses.scss';
import './CSS/HUD.scss';
import './CSS/Defenses.scss';
import './CSS/Solutions.scss';
import './CSS/Menu.scss';
import './CSS/MenuWindow.scss';
import './CSS/LoadingScreen.scss';
import './CSS/VictoryOverlay.scss';
import './CSS/HealthBar.scss';
import 'semantic-ui-css/semantic.min.css';
import './tutorial/AlertContents.scss';

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
            camera: false,
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
        this.onCameraMove = this.onCameraMove.bind(this);
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

        this.setState({ socket: socket });
    }

    onCameraMove() {
        this.setState({ camera: true });
    }

    render() {
        return (
            <SocketContext.Provider value={this.state.socket}>
                <div>
                    {this.state.token && (
                        <ConnectionOverlay
                            key={this.state.socket == null}
                            socket={this.state.socket}
                            camera={this.state.camera}
                        />
                    )}
                    {this.state.socket && (
                        <VictoryOverlay socket={this.state.socket} />
                    )}

                    {this.state.socket && (
                        <HealthBarContainer socket={this.state.socket} />
                    )}

                    {this.state.socket && (
                        <Provider
                            template={(props) => props.message}
                            {...{
                                timeout: 0,
                                position: 'bottom center'
                            }}
                        >
                            <Tutorial socket={this.state.socket} />
                        </Provider>
                    )}

                    <Windows ref={this.windows} />

                    {this.state.socket && this.state.camera && (
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
                            onCameraMove={this.onCameraMove}
                            token={this.state.token}
                        />
                    )}
                </div>
            </SocketContext.Provider>
        );
    }
}

const GameContainer = withLogin(App, '/game.html');

// @TODO: codesplitting
export default function createApp() {
    window.addEventListener('DOMContentLoaded', () => {
        const elem = document.getElementsByClassName('app')[0];
        switch (elem.id) {
        case 'game':
            ReactDOM.render(<GameContainer />, elem);
            break;
        case 'mode_select':
            ReactDOM.render(<ModeSelect />, elem);
            break;
        default:
            break;
        }
    });
}
