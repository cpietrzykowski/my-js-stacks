function _assign(target, source) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (target[key] instanceof Object) {
        _assign(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return target;
}

/**
 * reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
 * reference: https://gist.github.com/Salakar/1d7137de9cb8b704e48a
 * use Object.assign unless deep traversal is required
 * @return {Object} a new object
 */
export default function deepAssign(target, ...sources) {
  // assign all arguments onto result
  sources.forEach(function(source) {
    _assign(target, Object(source));
  });

  return target;
}
