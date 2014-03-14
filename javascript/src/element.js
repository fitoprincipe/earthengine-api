/**
 * @fileoverview Base class for Image, Feature and Collection.
 * This class is never intended to be instantiated by the user.
 *
 */

goog.provide('ee.Element');

goog.require('ee.ApiFunction');
goog.require('ee.ComputedObject');
goog.require('ee.Types');
goog.require('goog.array');
goog.require('goog.object');



/**
 * A ComputedObject that can be stored in a collection.
 * @param {ee.Function} func The same argument as in ee.ComputedObject().
 * @param {Object} args The same argument as in ee.ComputedObject().
 * @param {string?=} opt_varName The same argument as in ee.ComputedObject().
 * @constructor
 * @extends {ee.ComputedObject}
 */
ee.Element = function(func, args, opt_varName) {
  goog.base(this, func, args, opt_varName);
  ee.Element.initialize();
};
goog.inherits(ee.Element, ee.ComputedObject);
// Exporting manually to avoid marking the class public in the docs.
goog.exportSymbol('ee.Element', ee.Element);


/**
 * Whether the class has been initialized with API functions.
 * @type {boolean}
 * @private
 */
ee.Element.initialized_ = false;


/**
 * Imports API functions to this class.
 */
ee.Element.initialize = function() {
  if (!ee.Element.initialized_) {
    ee.ApiFunction.importApi(ee.Element, 'Element', 'Element');
    ee.Element.initialized_ = true;
  }
};


/**
 * Removes imported API functions from this class.
 */
ee.Element.reset = function() {
  ee.ApiFunction.clearApi(ee.Element);
  ee.Element.initialized_ = false;
};


/** @inheritDoc */
ee.Element.prototype.name = function() {
  return 'Element';
};


/**
 * Overrides one or more metadata properties of an Element.
 *
 * @param {...Object} var_args Either a dictionary of properties, or a
 *     vararg sequence of properties, e.g. key1, value1, key2, value2, ...
 * @return {ee.Element} The element with the specified properties overridden.
 * @export
 */
ee.Element.prototype.set = function(var_args) {
  // TODO(user): Remove fallback once Element.set() is live.
  var result = this;
  if (arguments.length <= 1) {
    var properties = arguments[0];
    if (!goog.isObject(properties)) {
      throw Error('When Element.set() is passed one argument, it must ' +
                  'be a dictionary.');
    }
    // Try to be smart about interpreting the argument.
    // Check that we have a plain object, with 1 property called 'properties',
    // which is itself a plain object.
    if (ee.Types.isRegularObject(properties) &&
        goog.array.equals(goog.object.getKeys(properties), ['properties']) &&
        ee.Types.isRegularObject(properties['properties'])) {
      // Looks like a call with keyword parameters. Extract them.
      properties = /** @type {Object.<*>} */(properties['properties']);
    }

    try {
      for (var key in properties) {
        var value = properties[key];
        result = ee.ApiFunction._call('Element.set', result, key, value);
      }
    } catch (e) {
      // No Element.set() defined yet. Use Feature.set().
      result = ee.ApiFunction._call('Feature.set', result, properties);
    }
  } else {
    // Interpret as key1, value1, key2, value2, ...
    if (arguments.length % 2 != 0) {
      throw Error('When Element.set() is passed multiple arguments, there ' +
                  'must be an even number of them.');
    }
    try {
      for (var i = 0; i < arguments.length; i += 2) {
        var key = arguments[i];
        var value = arguments[i + 1];
        result = ee.ApiFunction._call('Element.set', result, key, value);
      }
    } catch (e) {
      // No Element.set() defined yet. Use Feature.set().
      var properties = {};
      for (var i = 0; i < arguments.length; i += 2) {
        var key = arguments[i];
        var value = arguments[i + 1];
        properties[key] = value;
      }
      result = ee.ApiFunction._call('Feature.set', result, properties);
    }
  }
  // Manually cast the result to an image.
  return this.cast(result);
};
