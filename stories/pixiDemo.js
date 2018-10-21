import React from 'react';

import { storiesOf } from '@storybook/react';
import { Graphics, Filter } from 'pixi.js';
import { water } from '../src/shaders';

/**
 * This has pretty CPU high usage in the Chrome GPU process (~33%),
 * with or without the animation
 */
class PixiShader extends React.Component {
    componentDidMount() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        var app = new PIXI.Application();
        document.getElementById('shader').appendChild(app.view);

        var rect = new Graphics();
        rect.drawRect(0, 0, width / 4, height);

        let myFilter = new Filter(
            null,
            this.props.shader, // fragment shader
            {
                time: { value: 0.0 },
                resolution: { value: [width, height] }
            }
        );

        const fps = 60;
        const interval = 1000 / fps;
        window.setInterval(() => {
            myFilter.uniforms.time += interval;
        }, interval);
        rect.filters = [myFilter];
        app.stage.addChild(rect);
    }

    render() {
        return <div id="shader" />;
    }
}

const shader = `
    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform sampler2D uSampler;
    uniform vec4 uTextureClamp;
    uniform vec4 uColor;
    uniform vec2 resolution;
    uniform float time;

    float distFromCenter() {
        return length(vec2(.5,.5) - vTextureCoord);
    }

    void main(void)
    {
        float dis = distFromCenter();
        gl_FragColor = texture2D(uSampler, vTextureCoord);
        gl_FragColor.r = abs(cos(time/1000.0 + 20.0*dis));
        gl_FragColor.g = 0.0;
        gl_FragColor.b = 0.0;
    }
`;

storiesOf('PIXI', module)
    .add('circles', () => <PixiShader shader={shader} />)
    .add('water', () => <PixiShader shader={water} />);
