import { API } from 'homebridge';

import { PrusaLinkAccessory } from './prusaLinkAccessory';

export = (api: API) => {
  api.registerAccessory('homebridge-prusa-link', 'PrusaLinkDevice', PrusaLinkAccessory);
};
