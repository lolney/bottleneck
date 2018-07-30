import { configure } from '@storybook/react';
import 'babel-polyfill';

function loadStories() {
    require('../stories/index.stories.js');
    require('../stories/pixiDemo.js');
    require('../stories/solutionHistory.js');
    require('../stories/windows.js');
    require('../stories/defences.js');
    require('../stories/hud.js');

    // You can require as many stories as you need.
}

configure(loadStories, module);
