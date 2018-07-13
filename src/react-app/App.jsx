import React from 'react';
import ReactDOM from 'react-dom';
import EditorModal from './EditorModal.jsx';

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
    \ --> Token     ^ Socket
      Game ---------|
*/

class App extends React.Component {
    render() {
        return <EditorModal clientEngine={this.props.clientEngine} />;
    }
}

export default function createApp(clientEngine) {
    window.addEventListener('DOMContentLoaded', () => {
        ReactDOM.render(
            <App clientEngine={clientEngine} />,
            document.getElementById('overlay')
        );
    });
}
