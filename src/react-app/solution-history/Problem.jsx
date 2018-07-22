import React from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import '.././CSS/Solutions.scss';

export default class Problem extends React.Component {
    render() {
        return (
            <div className="bootstrap-styles">
                <DropdownButton
                    bsStyle="default"
                    bsSize="large"
                    title={this.props.problems[0].name}
                    id="dropdown-size-large"
                >
                    <MenuItem eventKey="1">
                        {this.props.problems[1].name}
                    </MenuItem>
                    <MenuItem eventKey="2">
                        {this.props.problems[2].name}
                    </MenuItem>
                    <MenuItem eventKey="3">
                        {this.props.problems[3].name}
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem eventKey="4">Separated link</MenuItem>
                </DropdownButton>
            </div>
        );
    }
}

Problem.propTypes = {
    problems: PropTypes.object.isRequired
};
