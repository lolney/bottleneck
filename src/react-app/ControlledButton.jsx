import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
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
                className={this.props.className}
                onClick={() => {
                    if (this.state.selected == false) {
                        this.props.addWindow(() => this.toggleSelect());
                        this.toggleSelect();
                    } else {
                        this.props.removeWindow();
                    }
                }}
                active={this.state.selected}
            >
                {this.props.children}
            </Button>
        );
    }
}

ControlledButton.propTypes = {
    //    addMenu: PropTypes.func.isRequired,
    //    removeMenu: PropTypes.func.isRequired,
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ])
};
