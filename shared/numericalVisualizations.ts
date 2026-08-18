export type XYPoint = { x: number; y: number };

export function lagrangeValue(points: XYPoint[], x: number) {
  return points.reduce((sum, point, index) => {
    const basis = points.reduce(
      (product, other, otherIndex) => otherIndex === index ? product : product * ((x - other.x) / (point.x - other.x)),
      1,
    );
    return sum + point.y * basis;
  }, 0);
}

export function newtonIterationSeries(start: number, count = 7) {
  const points: { iteration: number; x: number; error: number }[] = [];
  let current = start;
  for (let iteration = 0; iteration < count; iteration += 1) {
    const f = current ** 3 - current - 2;
    points.push({ iteration: iteration + 1, x: Number(current.toFixed(5)), error: Number(Math.abs(f).toFixed(5)) });
    current -= f / (3 * current ** 2 - 1);
  }
  return points;
}

export function eulerSeries(step: number, end = 2) {
  const values: { x: number; euler: number; exact: number }[] = [];
  let x = 0;
  let y = 0.5;
  for (let index = 0; index <= Math.round(end / step); index += 1) {
    const exact = (x + 1) ** 2 - 0.5 * Math.exp(x);
    values.push({ x: Number(x.toFixed(2)), euler: Number(y.toFixed(4)), exact: Number(exact.toFixed(4)) });
    y += step * (y - x ** 2 + 1);
    x += step;
  }
  return values;
}
