/**
 * only joins truthy elements of collection
 * @method joinCollection
 * @param  {[type]}       separator  [description]
 * @param  {[type]}       collection [description]
 * @return string
 */
export default function joinCollection(separator, ...collection) {
  return collection.filter(function(item) {
    return item;
  }).join(separator);
}
