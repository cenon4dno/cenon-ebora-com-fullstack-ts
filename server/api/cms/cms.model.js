'use strict';

import mongoose from 'mongoose';

var CmsSchema = new mongoose.Schema({
  tag: String,
  message: String
});

export default mongoose.model('Cms', CmsSchema);
