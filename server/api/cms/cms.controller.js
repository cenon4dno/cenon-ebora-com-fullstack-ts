/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/cms              ->  index
 * POST    /api/cms              ->  create
 * GET     /api/cms/:id          ->  show
 * PUT     /api/cms/:id          ->  upsert
 * PATCH   /api/cms/:id          ->  patch
 * DELETE  /api/cms/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Cms from './cms.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of cms
export function index(req, res) {
  return Cms.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Cms from the DB
export function show(req, res) {
  return Cms.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Cms in the DB
export function create(req, res) {
  return Cms.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Cms in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Cms.findOneAndUpdate(req.params.id, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Cms in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Cms.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Cms from the DB
export function destroy(req, res) {
  return Cms.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
