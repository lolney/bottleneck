import React from 'react';
import HUD from './HUD';
import Menu from './Menu';
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
                <Menu isOpen={this.state.isOpen} />
                <HUD onClick={this.openWindow} />
            </div>
        );
    }
}
