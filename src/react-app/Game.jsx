import React from 'react';
import querystring from 'query-string';
import MyClientEngine from '../client/MyClientEngine';
import MyGameEngine from '../common/MyGameEngine';
import { clientDefaults } from '../config';

// TODO: replace auth with token
export default class Game extends React.Component {
    componentDidMount() {
        const qsOptions = querystring.parse(location.search);
        const mode = qsOptions.mode ? qsOptions.mode : 'practice';
        let options = Object.assign(clientDefaults, {
            matchmaker: `find_game?mode=${mode}`,
            matchmakerMethod: 'POST'
        });

        // create a client engine and a game engine
        const gameEngine = new MyGameEngine(options);
        const clientEngine = new MyClientEngine(gameEngine, options);

        clientEngine.start().then((socket) => {
            this.props.onReceiveSocket(socket);
            clientEngine.socket.on('solution', (data) => {
                gameEngine.renderer.onReceiveSolution(
                    data.problemId,
                    data.playerId
                );
            });
        });

        gameEngine.on('cameraMoved', () => this.props.onCameraMove());
    }

    render() {
        return <div className="pixiContainer" />;
    }
}
