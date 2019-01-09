import { configure } from '@storybook/react';
import 'babel-polyfill';

function loadStories() {
    require('../stories/index.stories.js');
    require('../stories/pixiDemo.js');
    require('../stories/solutionHistory.js');
    require('../stories/victoryOverlay.js');
    require('../stories/healthBar.js');
    require('../stories/windows.js');
    require('../stories/defenses.js');
    require('../stories/hud.js');
    require('../stories/menu.js');
    require('../stories/connectionOverlay.js');
    require('../stories/tutorialAlerts.js');
    require('../stories/tutorialArrow.js');
    require('../stories/regexProblems.js');
    // You can require as many stories as you need.
}

configure(loadStories, module);
