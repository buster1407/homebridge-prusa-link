import { API } from 'homebridge';

import { PrusaLinkAccessory } from './prusaLinkAccessory.js';

export default (api: API) => {
  api.registerAccessory('homebridge-prusa-link', 'PrusaLinkDevice', PrusaLinkAccessory);
};
