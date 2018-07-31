import React from 'react';
import HUD from './HUD.jsx';
import Menu from './Menu.jsx';
//import PropTypes from 'prop-types';

export default class MenuContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        };
        this.openWindow = this.openWindow.bind(this);
    }

    openWindow() {
        this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
    }

    render() {
        return (
            <div>
                {this.state.isOpen && <Menu isOpen={this.state.isOpen} />}
                <HUD onClick={this.openWindow} />
            </div>
        );
    }
}
