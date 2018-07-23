import Jasmine from 'jasmine';
import setup from './setup';

setup();

let jasmine = new Jasmine();
jasmine.loadConfigFile('spec/support/jasmine.json');
jasmine.execute();
