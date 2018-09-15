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
        this.escMenu = this.escMenu.bind(this);
    }

    componentDidMount() {
        window.addEventListener('keydown', this.escMenu);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.escMenu);
    }

    escMenu(event) {
        if (event.code != 'Escape') return;

        if (this.state.isOpen == true) {
            this.openMenu(this.callback);
            event.stopPropagation();
        }
    }

    openMenu(callback) {
        if (callback) {
            this.callback = callback;
        }
        if (this.callback) {
            if (this.state.isOpen == true) {
                this.callback();
            }
        }
        this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
    }

    render() {
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
