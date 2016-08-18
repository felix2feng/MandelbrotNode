const z = (r, i) => {
  return { r : r, i : i };
}

const multiply = (z1, z2) => {
  return { r : (z1.r * z2.r) - (z1.i * z2.i),
          i : (z1.i * z2.r) + (z1.r * z2.i) };
}

const add =(z1, z2) => {
  return { r : z1.r + z2.r, i : z1.i + z2.i };
}

const abs_squared = (z) => {
  return z.r*z.r + z.i*z.i;
}

const pretty_print = (z) => {
  return "" + z.r + "+" + z.i + "i";
}

// Calculate next using shortcut (x2-y2 - x, 2xy - y) 
const next = (z) => {
  return {r: z.r * z.r - z.i * z.i + z.r, i: 2 * z.r * z.i };
}

module.exports = { z, multiply, add, abs_squared, pretty_print, next };