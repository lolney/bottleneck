import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Represents a two-paned interface that filters the prop `data`
 * by the type that the user selects in the button pane. The filtered
 * data is then passed to the supplied children, appearing in the second pane.
 */
export default class SelectMenu extends React.Component {
    constructor(props) {
        super(props);

        this.checkIfSelected = this.checkIfSelected.bind(this);

        let types = Array.from(
            new Set(props.data.map((item) => props.getType(item)))
        );
        this.state = {
            selected: undefined,
            types: types
        };
    }

    render() {
        return (
            <div className="searchResults">
                <div className="sidebar bootstrap-styles">
                    <ButtonToolbar>
                        {this.state.types.map((type) => (
                            <SelectItem
                                onClick={() => {
                                    this.setState({
                                        selected:
                                            this.state.selected == type
                                                ? undefined
                                                : type
                                    });
                                }}
                                active={this.state.selected == type}
                                key={type}
                                {...this.props.buttonConfig[type]}
                            />
                        ))}
                    </ButtonToolbar>
                </div>

                {React.Children.map(this.props.children, (child) =>
                    React.cloneElement(child, {
                        data: this.props.data.filter(this.checkIfSelected)
                    })
                )}
            </div>
        );
    }

    checkIfSelected(item) {
        return this.state.selected == undefined
            ? item
            : this.props.getType(item) == this.state.selected;
    }
}

class SelectItem extends React.Component {
    render() {
        return (
            <Button onClick={this.props.onClick} active={this.props.active}>
                <div className="column">
                    <img
                        src={this.props.src}
                        alt={this.props.alt}
                        height="50"
                        width="50"
                    />
                </div>
                <h2 className="column">{this.props.text}</h2>
            </Button>
        );
    }
}

const buttonConfig = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
};

SelectItem.propTypes = {
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    ...buttonConfig
};

SelectMenu.propTypes = {
    /** Array to be filtered */
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    /**
     * Determines the types that the component filters by.
     * Function that takes an element of `data` and returns
     * the type of that object.
     */
    getType: PropTypes.func.isRequired,
    /**
     * Determines how the button for each type appears.
     * Expects a dictionary that maps each type to an object with
     * keys `src`, `alt`, and `text`.
     */
    buttonConfig: PropTypes.object.isRequired,
    /**
     * Elements to which the component passes the filtered list,
     * as the prop `data`.
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element
    ])
};
