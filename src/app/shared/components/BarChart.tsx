import { Grid, useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";
import { FC } from "react";
import Chart from "react-apexcharts";

interface BarChartProps {
  series: Array<number>;
  labels: Array<string>;
  height?: number;
  legendOption?: {
    show?: boolean;
    position?: "top" | "right" | "bottom" | "left";
  };
  showXAxisLabel?: boolean;
}

export const BarChart: FC<BarChartProps> = (props) => {
  const { series, labels, height, legendOption, showXAxisLabel } = props;
  const theme = useTheme();
  const chartOption: ApexOptions = {
    chart: {
      animations: {
        enabled: true,
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 800,
        },
      },
      height: height || 160,
      type: "bar",
    },
    colors: ["#9A56D3", "#FEBB68", "#A3A3A3", "#444444", "#B3743B", "#FFE2B8"],
    fill: {
      opacity: 1,
    },
    labels: [...labels],
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: "end",
        columnWidth: 37,
        distributed: true,
        barHeight: 10,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: legendOption?.show || true,
      position: legendOption?.position || "bottom",
      offsetY: 5,
      fontWeight: 600,
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
      labels: {
        useSeriesColors: true
      }
    },
    xaxis: {
      categories: labels,
      labels: {
        show: showXAxisLabel || false,
        trim: true,
        style: {
          colors: ["#000000"],
          fontSize: "12px",
        },
        offsetY: -2,
      },
    },
    yaxis: {
      show: false,
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const bgColor = w.globals.colors[dataPointIndex];
        return `
            <div class="chart_tooltip" style="background-color:${bgColor}"> 
                <span>${w.globals.labels[dataPointIndex]}</span> :
                <span>${series[seriesIndex][dataPointIndex]}</span> 
            <div>
            `;
      },
    },
  };
  return (
    <Grid item xs={12}>
      <Chart
        options={chartOption}
        series={[
          {
            data: series,
          },
        ]}
        type="bar"
        height={height || 160}
      />
    </Grid>
  );
};
