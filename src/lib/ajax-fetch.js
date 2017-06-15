/**
 * simple promise wrapper for an ajax request
 * @method ajaxFetch
 * @param  {string}  path           request uri
 * @param  {string}  [method='GET'] request method
 * @param  {string}  [type='']      request type
 * @return {promise}                returns a promise wrapping the request
 */
export default function ajaxFetch(path, method = 'GET', type = '') {
  const p = new Promise(function(resolve, reject) {
    const request = new XMLHttpRequest();
    request.responseType = type;
    request.open(method, path, true);

    request.onload = function() {
      const reqok = ((request.status >= 200) && (request.status < 400));
      if (reqok) {
        resolve(request.response);
      } else {
        // We reached our target server, but it returned an error
        reject((({status, statusText}) => ({status, statusText}))(request));
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      reject((({status, statusText}) => ({status, statusText}))(request));
    };

    request.send();
  });

  return p;
}
