/**
 * Cms model events
 */

'use strict';

import {EventEmitter} from 'events';
import Cms from './cms.model';
var CmsEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CmsEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Cms.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    CmsEvents.emit(event + ':' + doc._id, doc);
    CmsEvents.emit(event, doc);
  };
}

export default CmsEvents;
