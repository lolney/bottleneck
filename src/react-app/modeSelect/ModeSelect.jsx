import React from 'react';
import { Button } from 'react-bootstrap';
import Header from './Header.jsx';

import './ModeSelect.scss';

export default class ModeSelect extends React.Component {
    render() {
        return (
            <div>
                <Header />
                <div className="matchmaking">
                    <div className="matchmaking-box">
                        <div className="title-box">
                            <div className="img-container">
                                <img
                                    className="player-img"
                                    alt="player icon"
                                    src="assets/PlayerFace.png"
                                />
                            </div>
                            <div className="text-box">
                                <div className="title">Bottleneck</div>
                                <div className="subtitle">
                                    {'Automate your base. Assault your opponent\'s.'}
                                </div>
                            </div>
                        </div>

                        <div className="body-box">
                            {[
                                {
                                    title: 'Practice',
                                    src: 'assets/noun_boxing.png',
                                    url: 'game.html?mode=practice',
                                    alt:
                                        'Join a sandbox game without other players'
                                },
                                {
                                    title: 'VS',
                                    src: 'assets/noun_fighting.png',
                                    url: 'game.html?mode=vs',
                                    alt: 'Play against another human'
                                }
                            ].map((config, i) => ModeButton(config, i))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const ModeButton = (config, i) => (
    <div key={config.title} className="btn-cont">
        <a href={config.url} title={config.alt}>
            <Button className={`large-btn btn-${i + 1} hud-button`}>
                <img className="btn-row-1" src={config.src} width="50px" />
                <div className="btn-row-2">{config.title}</div>
            </Button>
        </a>
    </div>
);
