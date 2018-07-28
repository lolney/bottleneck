import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import DefencesBrowser from '../src/react-app/defences/DefencesBrowser.jsx';
import { WindowsContainer } from './windows';
import '../src/react-app/CSS/Defences.scss';

class DefencesReporter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { drop: 'none yet', dragover: 'none yet' };
    }

    render() {
        return (
            <div>
                <div>{JSON.stringify(this.state.drop)}</div>
                <div>{JSON.stringify(this.state.dragover)}</div>
                <WindowsContainer>
                    <DefencesBrowser
                        imageSrcs={[
                            'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
                        ]}
                    />
                    <canvas
                        onDragOver={(ev) => {
                            ev.preventDefault();
                            this.setState({ dragover: ev.pageX });
                        }}
                        onDrop={(ev) => {
                            let data = ev.dataTransfer.getData('text');
                            this.setState({ drop: data });
                        }}
                        width="500"
                        Height="500"
                    />
                </WindowsContainer>
            </div>
        );
    }
}
storiesOf('Adding defences', module)
    .addDecorator(StorybookConsole)
    .add('Dragging demo', () => <DefencesReporter />);
