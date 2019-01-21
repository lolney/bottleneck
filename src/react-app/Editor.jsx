import React from 'react';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';

import 'brace/mode/javascript';
import 'brace/theme/github';

import './CSS/Editor.scss';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            markers: []
        };
        this.onChange = this.onChange.bind(this);
        this.aceEditor = React.createRef();
    }

    onChange(code) {
        this.props.onChange(code);
        this.setState({ value: code });
    }

    render() {
        return (
            <div className="editor">
                <fieldset>
                    <img src="https://avatars2.githubusercontent.com/u/8031562?s=400&u=f5735733f4049e4b75af582407b6766262465827&v=4" />
                    <title>Editor</title>
                    <div>
                        {this.props.generatorError && (
                            <div className="editorError">
                                {this.props.generatorError.message}
                            </div>
                        )}
                    </div>
                </fieldset>
                <div className="wrapper">
                    <AceEditor
                        ref={this.aceEditor}
                        mode="javascript"
                        theme="github"
                        value={this.state.value}
                        onChange={this.onChange}
                        name="UNIQUE_ID_OF_DIV"
                        width=""
                        editorProps={{ $blockScrolling: true }}
                    />
                </div>
            </div>
        );
    }
}

Editor.propTypes = {
    generatorError: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired
};
