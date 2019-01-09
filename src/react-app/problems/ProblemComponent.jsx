import React from 'react';
import BinaryTreeComponent from './BinaryTreeComponent.jsx';
import ImageComponent from './ImageComponent.jsx';
import PropTypes from 'prop-types';
import '../CSS/Image.scss';
import RegexComponent from './RegexComponent.jsx';

export default class ProblemComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            done: false
        };

        this.getChild.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        this.setState({ done: false });
    }

    handleShow() {
        this.setState({ done: true });
    }

    getChild(typeString) {
        switch (typeString) {
        case 'btree':
            return BinaryTreeComponent;
        case 'image':
            return ImageComponent;
        case 'regex':
            return RegexComponent;
        default:
            throw new TypeError('unexpected typeString');
        }
    }

    render() {
        const description = this.state.done
            ? 'You\'re done!'
            : this.props.problem.description;

        const child = React.createElement(
            this.getChild(this.props.problem.type),
            {
                problem: this.props.problem,
                setDone: (done) => {
                    if (done) {
                        this.props.onSolution(
                            this.props.problem.id,
                            this.props.generator
                        );
                        this.props.alert.success('Problem Solved!');
                    }
                    this.setState({ done: done });
                },
                generator: this.props.generator,
                reportError: this.props.reportError
            }
        );
        return (
            <div className="modal">
                <div className="wrapper">
                    <header className="header">
                        {this.props.problem.title}
                    </header>
                    {child}
                    <footer className="footer">{description}</footer>
                </div>
            </div>
        );
    }
}

ProblemComponent.propTypes = {
    generator: PropTypes.any.isRequired,
    reportError: PropTypes.func.isRequired,
    onSolution: PropTypes.func.isRequired,
    problem: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
    }).isRequired,
    alert: PropTypes.object.isRequired
};
