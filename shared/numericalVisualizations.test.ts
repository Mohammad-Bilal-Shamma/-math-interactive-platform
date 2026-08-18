import { describe, expect, it } from "vitest";
import { eulerSeries, lagrangeValue, newtonIterationSeries } from "./numericalVisualizations";

describe("numerical visualization data", () => {
  it("interpolates each supplied point exactly with the Lagrange polynomial", () => {
    const points = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }, { x: 3, y: -1 }];
    points.forEach(point => expect(lagrangeValue(points, point.x)).toBeCloseTo(point.y, 10));
  });

  it("reduces Newton residuals toward the cubic root", () => {
    const series = newtonIterationSeries(1.2);
    expect(series).toHaveLength(7);
    expect(series.at(-1)?.error).toBeLessThan(series[0].error);
    expect(series.at(-1)?.x).toBeCloseTo(1.52138, 4);
  });

  it("returns the expected Euler number of points and an initial-condition match", () => {
    const series = eulerSeries(0.25);
    expect(series).toHaveLength(9);
    expect(series[0]).toMatchObject({ x: 0, euler: 0.5, exact: 0.5 });
  });
});
