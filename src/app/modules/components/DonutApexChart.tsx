import { Card, Typography, Grid, Stack } from "@mui/material";

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useIntl } from "react-intl";

function createData(
  date: string,
  type: string,
  count: number,
  reason: string,
  status: string
) {
  return { date, type, count, reason, status };
}

const chartOptions: ApexOptions = {
  chart: {
    background: "transparent",
    stacked: false,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "60%",
      },
    },
  },
  colors: ["#FEBB68", "#A3A3A3", "#9A56D3"],
  dataLabels: {
    enabled: false,

    formatter: function (val: number) {
      const percent = val / 1;
      return percent.toFixed(0) + "%";
    },
    background: {
      enabled: true,
      padding: 8,
      borderRadius: 4,
      borderWidth: 0,
      opacity: 0.3,
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        opacity: 0.5,
      },
    },
  },
  fill: {
    opacity: 1,
  },
  labels: ["Casual", "Medical", "Earned", "Unpaid"],
  legend: {
    show: false,
  },
  stroke: {
    width: 0,
  },
};

const chartSeries = [4, 3, 16];

function DonutApexChart() {
  const intl = useIntl();
  return (
    <Grid item xs={12} spacing={4}>
      <Chart
        height={155}
        options={chartOptions}
        series={chartSeries}
        type="donut"
      />
    </Grid>
  );
}

export default DonutApexChart;
