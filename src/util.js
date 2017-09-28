define([], function() {
  
  function getMask(mask, flag) {
    return mask & flag;
  }
  
  function setMask(mask, flag) {
    return mask | flag;
  }
  
  function unsetMask(mask, flag) {
    return mask & (~flag);
  }
  
  function toggleMask(mask, flag) {
    return mask ^ flag;
  }
  
  function combine(/* ...sources */) {
    var args = [{}];
    for(var i = 0 ; i < arguments.length ; i++) {
      args.push(arguments[i]);
    }
    return Object.assign.apply(void 0, args);
  }
  
  var TypedArrayProto = Uint8Array.prototype.__proto__;
  
  function copy(obj) {
    if(Array.isArray(obj)) {
      var length = obj.length;
      var copy = new Array(length);
      for(var i = 0 ; i < length ; i++) {
        copy[i] = obj[i];
      }
      return copy;
    }
    if(TypedArrayProto.isPrototypeOf(obj)) {
      return new obj.constructor(obj);
    }
    return combine(obj);
  }
  
  function removeDuplicates(array) {
    var cache = {};
    return array.reduce(function(collection, val, i) {
      var nextCollection = (cache[val] === void 0) ? collection.concat(val) : collection;
      cache[val] = i;
      return nextCollection;
    }, []);
  }
  
  return {
    getMask: getMask,
    setMask: setMask,
    unsetMask: unsetMask,
    toggleMask: toggleMask,
    combine: combine,
    copy: copy,
    removeDuplicates: removeDuplicates
  };
})
