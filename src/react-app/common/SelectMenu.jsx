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
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    getType: PropTypes.func.isRequired,
    buttonConfig: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element
    ])
};
