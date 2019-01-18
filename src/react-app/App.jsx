import React from 'react';
import ReactDOM from 'react-dom';

export default function createApp() {
    window.addEventListener('DOMContentLoaded', () => {
        const elem = document.getElementsByClassName('app')[0];
        switch (elem.id) {
            case 'game':
                import('./GameContainer.jsx').then((GameContainer) => {
                    ReactDOM.render(<GameContainer.default />, elem);
                });
                break;
            case 'mode_select':
                import('./modeSelect/App.jsx').then((ModeSelect) => {
                    ReactDOM.render(<ModeSelect.default />, elem);
                });
                break;
            default:
                break;
        }
    });
}
