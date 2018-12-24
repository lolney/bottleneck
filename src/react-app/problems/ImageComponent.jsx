import React from 'react';
import { Image } from '../../problem-engine/ImageProblem';
import PropTypes from 'prop-types';
import { ProblemSubComponentTypes } from './PropTypes';

export default class ImageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            generator: this.props.generator,
            target: this.props.problem.target
        };
        this.problem = new Image(this.props.problem.original);

        this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }

    componentDidMount() {
        this.componentDidUpdate({ generator: null });
    }

    componentDidUpdate(prevProps) {
        if (this.props.generator != prevProps.generator) {
            let wrapped = Image.wrapGenerator(this.props.generator);
            Image.create(wrapped)
                .then((newImage) => {
                    if (this.problem.original == newImage.original)
                        this.props.setDone(true);
                    else this.props.setDone(false);

                    this.setState({ target: newImage.original });
                    this.props.reportError(null);
                })
                .catch((error) => {
                    this.props.reportError(error);
                });
        }
    }

    render() {
        return (
            <div className="imageProblem">
                <section className="content">
                    <div className="row-1">
                        <aside className="caption-first">Original</aside>
                        <aside className="caption-second">Target</aside>
                    </div>
                    <div className="row-2">
                        <img
                            src={this.props.problem.original}
                            className="image-first"
                        />
                        <img src={this.state.target} className="image-second" />
                    </div>
                </section>
            </div>
        );
    }
}

ImageComponent.propTypes = {
    ...ProblemSubComponentTypes,
    problem: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        original: PropTypes.string,
        target: PropTypes.string
    }).isRequired
};