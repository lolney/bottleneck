import React from 'react';
import HUD from './HUD.jsx';
import Menu from './Menu.jsx';
import MenuWindow from './Menu.jsx';
//import DefencesBrowser from './DefencesBrowser.jsx';
import PropTypes from 'prop-types';

export default class MenuContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        };
        this.openMenu = this.openMenu.bind(this);
    }

    openMenu() {
        this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
    }

    render() {
        console.log(this.props);
        return (
            <div>
                {this.state.isOpen && (
                    <MenuWindow
                        socket={this.props.socket}
                        addWindow={this.props.addWindow}
                        removeWindow={this.props.removeWindow}
                    />
                )}
                <HUD
                    openWindow={this.openMenu}
                    addWindow={this.props.addWindow}
                    removeWindow={this.props.removeWindow}
                    socket={this.props.socket}
                />
            </div>
        );
    }
}

MenuContainer.propTypes = {
    socket: PropTypes.object.isRequired,
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired
};
