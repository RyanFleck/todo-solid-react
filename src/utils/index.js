import { expandedProperty } from './context';
import * as ldflexHelper from './ldflex-helper';
import * as notification from './notification';
import * as storageHelper from './storage';
import * as permissionHelper from './permissions';
import * as languageHelper from './language';

function* entries(obj) {
  for (const key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

export {
  expandedProperty,
  entries,
  ldflexHelper,
  storageHelper,
  notification,
  permissionHelper,
  languageHelper
};
