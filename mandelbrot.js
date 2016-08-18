const complex = require('./complex');

const make_complex = function(r, i) {
  return complex.z(r, i);
}

const iterateonce = function(req)  {
  var next = {
    // z : complex.add(complex.multiply(req.z, req.z), req.c), // z*z + c
    z : complex.next(req.z), // z*z + c
    c : req.c,
    n : req.n + 1
    };
  return next;
}

const iterate = function(z, c, n) {
  const n0 = n;
  const maxIterations = 50;
  let request = {z:z, c:c, n:n};
  while (!escaped(request.z) && (request.n < n0 + maxIterations)) {
    request = iterateonce(request);
  }
  return request;
}

const escaped = function(z) {
  return complex.abs_squared(z) >= 4
}

const pretty_print = complex.pretty_print;

module.exports = { make_complex, iterate, escaped, pretty_print };

