import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import SelectMenu from '../../src/react-app/common/SelectMenu.jsx';
import buttonConfig from '../../src/react-app/solution-history/buttonConfig';
import Grid from '../../src/react-app/solution-history/Grid.jsx';
import Problem, { bin } from '../../src/react-app/solution-history/Problem.jsx';
import { MenuItem } from 'react-bootstrap';

import { solvedProblems } from '../../stories/fixtures';

Enzyme.configure({ adapter: new Adapter() });
process.env.NODE_ENV = 'test';

const subtypes = ['none', 'gradient', 'sin'];

describe('SelectMenu', () => {
    it('When type x selected, items show up iff they\'re type x', () => {
        let selectMenu = mount(
            <SelectMenu
                data={solvedProblems}
                buttonConfig={buttonConfig}
                getType={(e) => e.problem.type}
            >
                <Problem />
            </SelectMenu>
        );
        selectMenu.setState({ selected: 'image' });
        let selected = selectMenu.state('selected');
        let grid = selectMenu.find(Grid);

        expect(
            grid
                .prop('solvedProblems')
                .every((solved) => selected == solved.problem.type)
        ).toBe(true);
    });

    it('All subtypes appear in the menu', () => {
        let problem = mount(<Problem data={solvedProblems} />);

        let menuItems = problem.find(MenuItem);

        expect(menuItems.length).toEqual(subtypes.length);
    });

    // Subtypes for type x show up (including 'none')
    it('When type x, subtype y selected, items show up iff they\'re type x.y (including "none")', () => {
        let problem = mount(<Problem data={solvedProblems} />);
        let grid = problem.find(Grid);

        let subtype = problem.state('selected');
        let gridProblems = grid.prop('solvedProblems');

        if (subtype == 'none') {
            expect(
                gridProblems.every(
                    (solved) => undefined == solved.problem.subproblem
                )
            ).toBe(true);
        } else {
            expect(
                gridProblems.every(
                    (solved) => subtype == solved.problem.subproblem.type
                )
            ).toBe(true);
        }
    });
});

describe('bin', () => {
    it('correctly separates subcategories', () => {
        let bins = bin(solvedProblems);

        expect(Object.keys(bins).sort()).toEqual(subtypes.sort());
    });
});
