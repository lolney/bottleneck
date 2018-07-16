import { configure } from '@storybook/react';
import 'babel-polyfill';

function loadStories() {
    require('../stories/index.stories.js');
    require('../stories/pixiDemo.js');
    // You can require as many stories as you need.
}

configure(loadStories, module);
