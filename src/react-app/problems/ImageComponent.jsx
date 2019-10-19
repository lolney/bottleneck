import React from 'react';
import { Image } from '../../problem-engine/ImageProblem';
import PropTypes from 'prop-types';
import { ProblemSubComponentTypes } from './PropTypes';
import OriginalTargetComponent from './OriginalTargetComponent.jsx';

export default class ImageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            target: this.props.problem.target
        };
        this.problem = new Image(this.props.problem.original);

        this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }

    async componentDidUpdate(prevProps) {
        if (this.props.generator != prevProps.generator) {
            try {
                const wrapped = Image.wrapGenerator(this.props.generator);
                const newImage = await Image.create(wrapped);
                const isApproximatelyEqual = await newImage.compareImage(
                    this.problem
                );

                if (isApproximatelyEqual) this.props.setDone(true);
                else this.props.setDone(false);

                this.setState({ target: newImage.original });
                this.props.reportError(null);
            } catch (error) {
                this.props.reportError(error);
            }
        }
    }

    render() {
        return (
            <OriginalTargetComponent
                original={
                    <div className="image-container">
                        <img
                            src={this.props.problem.original}
                            className="image"
                        />
                    </div>
                }
                target={
                    <div className="image-container">
                        <img src={this.state.target} className="image" />
                    </div>
                }
            />
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
