import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import './CSS/Menu.scss';
import './CSS/MenuWindow.scss';

export default class MenuWindow extends React.Component {
    render() {
        return (
            <div className="menuWindow">
                <Menu />
            </div>
        );
    }
}

class Menu extends React.Component {
    render() {
        return (
            <div className="menu">
                <div className="fieldset">
                    <h1>Main Menu</h1>
                </div>
                <div className="menuElements bootstrap-styles">
                    <ButtonToolbar>
                        <Button>Solution History</Button>
                        <Button>Settings</Button>
                        <Button>Exit Game</Button>
                    </ButtonToolbar>
                </div>
            </div>
        );
    }
}
