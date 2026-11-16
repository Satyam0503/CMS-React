import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DonutApexChart from "./DonutApexChart";

describe("DonutApexChart", () => {
  it("renders with the Vite-optimized React ApexCharts export", () => {
    const markup = renderToStaticMarkup(
      <DonutApexChart series={[2, 3]} labels={["Present", "Leave"]} />,
    );

    expect(markup).toContain("<div");
  });
});
