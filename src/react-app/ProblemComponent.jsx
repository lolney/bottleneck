import React from 'react';
import BinaryTreeComponent from './BinaryTreeComponent.jsx';
import ImageComponent from './ImageComponent.jsx';
import PropTypes from 'prop-types';
import './CSS/Image.scss';

export default class ProblemComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            done: false
        };
        this.getChild.bind(this);
    }

    getChild(typeString) {
        switch (typeString) {
            case 'btree':
                return BinaryTreeComponent;
            case 'image':
                return ImageComponent;
            default:
                throw new TypeError('unexpected typeString');
        }
    }

    // Receives props title, description, original and target
    render() {
        const description = this.state.done
            ? "You're done!"
            : this.props.problem.description;

        const child = React.createElement(
            this.getChild(this.props.problem.type),
            {
                // TODO: consider a context here?
                problem: this.props.problem,
                setDone: (done) => {
                    if (done) this.props.onSolution(this.props.problem.id);
                    this.setState({ done: done });
                },
                generator: this.props.generator,
                reportError: this.props.reportError
            }
        );
        return (
            <div className="wrapper">
                <header className="header">{this.props.problem.title}</header>
                {child}
                <footer className="footer">{description}</footer>
            </div>
        );
    }
}

ProblemComponent.propTypes = {
    generator: PropTypes.func.isRequired,
    reportError: PropTypes.func.isRequired,
    onSolution: PropTypes.func.isRequired,
    problem: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string
    }).isRequired
};
