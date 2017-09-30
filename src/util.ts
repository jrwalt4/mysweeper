export function getMask(mask, flag) {
  return mask & flag;
}

export function setMask(mask, flag) {
  return mask | flag;
}

export function unsetMask(mask, flag) {
  return mask & (~flag);
}

export function toggleMask(mask, flag) {
  return mask ^ flag;
}

export function combine(...sources) {
  return Object.assign({}, ...sources);
}

var TypedArrayProto = Object.getPrototypeOf(Uint8Array.prototype);

export function copy(obj) {
  if (Array.isArray(obj)) {
    var length = obj.length;
    var copy = new Array(length);
    for (var i = 0; i < length; i++) {
      copy[i] = obj[i];
    }
    return copy;
  }
  if (TypedArrayProto.isPrototypeOf(obj)) {
    return new obj.constructor(obj);
  }
  return combine(obj);
}

export function removeDuplicates(array) {
  var cache = {};
  return array.reduce(function (collection, val, i) {
    var nextCollection = (cache[val] === void 0) ? collection.concat(val) : collection;
    cache[val] = i;
    return nextCollection;
  }, []);
}
