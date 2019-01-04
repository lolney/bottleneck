import React from 'react';
import querystring from 'query-string';
import MyClientEngine from '../client/MyClientEngine';
import MyGameEngine from '../common/MyGameEngine';
import { clientDefaults } from '../config';
import resolver from './login/resolver';
import { withAuth } from '@okta/okta-react';
import propTypes from 'prop-types';

class Game extends React.Component {
    componentDidMount() {
        const qsOptions = querystring.parse(location.search);
        const mode = qsOptions.mode ? qsOptions.mode : 'practice';

        this.props.auth.getAccessToken().then((token) => {
            let options = Object.assign(clientDefaults, {
                auth: { token },
                matchmaker: `match?mode=${mode}`,
                matchmakerMethod: 'POST',
                resolver: resolver(this.props.auth)
            });

            // create a client engine and a game engine
            const gameEngine = new MyGameEngine(options);
            const clientEngine = new MyClientEngine(gameEngine, options);

            gameEngine.on('cameraMoved', () => this.props.onCameraMove());

            clientEngine.start().then(({ socket, gameApi }) => {
                this.props.onStart(socket, gameApi);
                clientEngine.socket.on('solution', (data) => {
                    gameEngine.renderer.onReceiveSolution(
                        data.problemId,
                        data.playerId
                    );
                });

                // Sync server game status with client
                socket.on('gameState', (data) => {
                    console.log(data);
                    gameEngine.setStatus(data.state);
                });
            });
        });
    }

    render() {
        return <div className="pixiContainer" />;
    }
}

Game.propTypes = {
    auth: propTypes.object.isRequired,
    onStart: propTypes.func.isRequired,
    onCameraMove: propTypes.func.isRequired
};

export default withAuth(Game);
