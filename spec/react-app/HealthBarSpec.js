import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import HealthBarContainer from '../../src/react-app/HealthBarContainer';
import HealthBar from '../../src/react-app/HealthBar';
import { playerBase } from '../../src/config';

Enzyme.configure({ adapter: new Adapter() });
process.env.NODE_ENV = 'test';

describe('HealthBar', () => {
    let healthbar;
    let callback;

    beforeEach(() => {
        let socket = {
            connected: true,
            on: (event, cb) => {
                callback = cb;
            },
            off: () => {},
            removeListener: () => {}
        };
        healthbar = mount(<HealthBarContainer socket={socket} />);
    });

    afterEach(() => {
        healthbar.unmount();
    });

    it('state set properly', () => {
        const hp = playerBase.baseHP;

        let values = Object.values(healthbar.state('data'));
        for (const value of values) {
            expect(value).toEqual(hp);
        }

        callback({ enemyHp: 0 });

        expect(healthbar.state('data').enemyHp).toEqual(0);
        expect(healthbar.state('data').myHp).toEqual(hp);
    });

    it('health bar set preoperly', () => {
        callback({ myHp: 0 });

        healthbar.update();

        let myHp = healthbar.find('.myHp');
        let enemyHp = healthbar.find('.enemyHp');

        expect(myHp.prop('style').transform).toEqual('scaleX(0)');
        expect(enemyHp.prop('style').transform).toEqual('scaleX(1)');
    });
});
