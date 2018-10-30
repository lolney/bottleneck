import withSocket from './withSocket.jsx';
import HealthBar from './HealthBar.jsx';
import { playerBase } from '../config.js';

export default withSocket(HealthBar, [['hp', (data) => data]], () => ({
    myHp: playerBase.baseHP,
    enemyHp: playerBase.baseHP
}));
