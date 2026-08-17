import './style.css';
import { mount, goto } from './game/router.js';
import { load } from './game/core/state.js';

import './game/ui/mainMenu.js';
import './game/ui/createPlayer.js';
import './game/modes/career.js';
import './game/modes/shootout.js';
import './game/modes/tournament.js';
import './game/modes/goalkeeper.js';
import './game/modes/training.js';
import './game/modes/statistics.js';
import './game/modes/achievementsScreen.js';

const app = document.getElementById('app');
mount(app);

load();
goto('mainMenu');
