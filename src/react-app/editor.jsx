import React from 'react';
import { renderToString } from 'react-dom/server';
import brace from 'brace';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';

import 'brace/mode/javascript';
import 'brace/theme/github';

import './CSS/Editor.scss';

export default class Editor extends React.Component {
    render() {
        return (
            <div>
                <fieldset>
                    <img src="https://avatars2.githubusercontent.com/u/8031562?s=400&u=f5735733f4049e4b75af582407b6766262465827&v=4" />
                    <title>Editor</title>
                    <label>
                        Theme:
                        <select id="game-theme" size="1">
                            <optgroup label="bright">
                                <option value="chrome">chrome</option>
                                <option value="clouds">clouds</option>
                                <option value="crimson_editor">
                                    crimson_editor
                                </option>
                                <option value="dawn">dawn</option>
                                <option value="dreamweaver">dreamweaver</option>
                                <option value="eclipse">eclipse</option>
                                <option value="github">github</option>
                                <option value="solarized_light">
                                    solarized_light
                                </option>
                                <option value="textmate">textmate</option>
                                <option value="tomorrow" defaultValue>
                                    tomorrow
                                </option>
                                <option value="xcode">xcode</option>
                            </optgroup>
                            <optgroup label="dark">
                                <option value="clouds_midnight">
                                    clouds_midnight
                                </option>
                                <option value="cobalt">cobalt</option>
                                <option value="idle_fingers">
                                    idle_fingers
                                </option>
                                <option value="kr_theme">kr_theme</option>
                                <option value="merbivore">merbivore</option>
                                <option value="merbivore_soft">
                                    merbivore_soft
                                </option>
                                <option value="mono_industrial">
                                    mono_industrial
                                </option>
                                <option value="monokai">monokai</option>
                                <option value="pastel_on_dark">
                                    pastel_on_dark
                                </option>
                                <option value="solarized_dark">
                                    solarized_dark
                                </option>
                                <option value="terminal">terminal</option>
                                <option value="tomorrow_night">
                                    tomorrow_night
                                </option>
                                <option value="tomorrow_night_blue">
                                    tomorrow_night_blue
                                </option>
                                <option value="tomorrow_night_bright">
                                    tomorrow_night_bright
                                </option>
                                <option value="tomorrow_night_eighties">
                                    tomorrow_night_eighties
                                </option>
                                <option value="twilight">twilight</option>
                                <option value="vibrant_ink">vibrant_ink</option>
                            </optgroup>
                        </select>
                    </label>
                </fieldset>
                <div className="wrapper">
                    <AceEditor
                        mode="javascript"
                        theme="github"
                        onChange={this.props.onChange}
                        name="UNIQUE_ID_OF_DIV"
                        editorProps={{ $blockScrolling: true }}
                    />
                </div>
            </div>
        );
    }
}

Editor.propTypes = {
    onChange: PropTypes.func.isRequired
};
