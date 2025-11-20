import { Grid, } from "@mui/material";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface DonutApexChartProps {
  series: Array<number>;
  labels: Array<string>;
  height?: number;
  colors?: Array<any>;
  legendOption?: {
    show: boolean;
    position: "top" | "right" | "bottom" | "left";
  };
  size?: string;
  showDataLabels?: boolean;
  showLabelOnHover?: boolean;
}

function DonutApexChart(props: DonutApexChartProps) {
  const {
    series,
    labels,
    height,
    legendOption,
    size = "55%",
    showDataLabels,
    showLabelOnHover = false,
  } = props;

  const chartOptions: ApexOptions = {
    chart: {
      animations: {
        enabled: true,
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 800,
        },
      },
      stacked: false,
      type: "donut",
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: 40,
        },
        donut: {
          size: size,
          labels: {
            show: showLabelOnHover,
            name: {
              show: true,
              fontSize: "16px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
              color: "#373d3f",
              offsetY: -3,
              formatter: function (val) {
                return val;
              },
            },
            value: {
              show: showLabelOnHover,
              fontSize: "14px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 400,
              color: "#525252",
              offsetY: 0,
              formatter: function (val) {
                return val;
              },
            },
            total: {
              show: showLabelOnHover,
              showAlways: false,
              label: "Total",
              fontSize: "18px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
              color: "#071437",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => {
                  return a + b;
                }, 0);
              },
            },
          },
        },
      },
    },
    colors: ["#9b56c6", "#FEBB68", "#508a9b", "#6a5b17", "#873351", "#cc5e5d", "#5dcc6a",],
    dataLabels: {
      enabled: showDataLabels || false,
      formatter: function (value: number, opts) {
        const labels = opts.w.config.labels;
        const series = opts.w.config.series;
        return [
          `${series[opts.seriesIndex]} ${labels[opts.seriesIndex]}`,
        ] as unknown as string;
      },
      style: {
        fontFamily: "Arial, sans-serif",
        fontWeight: 500,
      },
      background: {
        enabled: false,
        opacity: 0,
        dropShadow: {
          enabled: false,
        },
      },
      dropShadow: {
        enabled: false,
      },
    },
    fill: {
      opacity: 1,
    },
    labels: [...labels],
    legend: {
      show: legendOption?.show || true,
      position: legendOption?.position || "bottom",
      offsetY: 10,
      fontWeight: 600,
      itemMargin: {
        horizontal: 10,
      },
      labels: {
        useSeriesColors: true,
      },
      markers: {
        offsetX: -2
      }
    },
    stroke: {
      width: 0,
    },
  };

  return (
    <Grid size={12}>
      <Chart
        height={height || 200}
        options={chartOptions}
        series={series}
        type="donut"
      />
    </Grid>
  );
}

export default DonutApexChart;
