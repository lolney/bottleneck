import React from 'react';
import PropTypes from 'prop-types';
import { ProblemSubComponentTypes } from './PropTypes';
import Highlighter from 'react-highlight-words';
import RegexProblem from '../../problem-engine/RegexProblem';
import OriginalTargetComponent from './OriginalTargetComponent.jsx';

export default class RegexComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            matches: []
        };
    }

    componentDidMount() {
        this.componentDidUpdate({});
    }

    componentDidUpdate(prevProps) {
        if (this.props.generator != prevProps.generator) {
            try {
                const generator = RegexProblem.wrapGenerator(
                    this.props.generator
                );
                let matches = generator(this.props.problem.text);
                matches = matches ? matches : [];

                this.setState({ matches });
                const done = this.checkWords(matches);

                this.props.setDone(done);
                this.props.reportError(null);
            } catch (error) {
                this.props.setDone(false);
                this.props.reportError(error);
            }
        }
    }

    checkWords(words) {
        const targetWords = this.props.problem.targetWords;

        if (words.length != targetWords.length) {
            return false;
        }

        const wordsSet = new Set(words);

        for (const elem of targetWords) {
            if (!wordsSet.has(elem)) return false;
        }

        return true;
    }

    render() {
        return (
            <OriginalTargetComponent
                original={
                    <div className="regexContainer">
                        <Highlighter
                            searchWords={this.state.matches}
                            autoEscape={true}
                            textToHighlight={this.props.problem.text}
                        />
                    </div>
                }
                target={
                    <div className="regexContainer">
                        <Highlighter
                            searchWords={this.props.problem.targetWords}
                            autoEscape={true}
                            textToHighlight={this.props.problem.text}
                        />
                    </div>
                }
            />
        );
    }
}

RegexComponent.propTypes = {
    ...ProblemSubComponentTypes,
    problem: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        text: PropTypes.string,
        targetWords: PropTypes.arrayOf(PropTypes.string)
    })
};
