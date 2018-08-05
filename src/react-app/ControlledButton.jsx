import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import './CSS/HUD.scss';
import DefencesBrowser from './defences/DefencesBrowser.jsx';
import PropTypes from 'prop-types';

export default class ControlledButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: false
        };
        this.toggleSelect = this.toggleSelect.bind(this);
    }
    toggleSelect() {
        this.setState((prevState) => ({ selected: !prevState.selected }));
    }

    render() {
        return (
            <Button
                onClick={() => {
                    if (this.state.selected == false) {
                        this.props.addWindow();
                        this.toggleSelect();
                    } else {
                        try {
                            this.props.removeWindow();
                            this.toggleSelect();
                        } catch (error) {
                            console.log(error);
                            this.props.addWindow();
                        }
                    }
                }}
            >
                {this.props.children}
            </Button>
        );
    }
}

ControlledButton.propTypes = {
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired,
    children: PropTypes.oneOfType(
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    )
};
