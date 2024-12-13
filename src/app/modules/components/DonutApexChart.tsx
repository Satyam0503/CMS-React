import { Card, Typography, Grid, Stack } from "@mui/material";

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useIntl } from "react-intl";

interface DonutApexChartProps {
  series:Array<number>;
  labels:Array<string>;
  height?:number;
  colors?:Array<any>;
  legendOption?:{
    show:boolean
    position:"top" | "right" | "bottom" |"left";
  }
  size?:string;
  showDataLabels?:boolean
  showLabelOnHover?:boolean
}


const chartSeries = [4, 3, 16];

function DonutApexChart(props:DonutApexChartProps) {
  const intl = useIntl();
  const { series=[] ,labels=[],height,colors,legendOption,size ="60%",showDataLabels,showLabelOnHover=false}= props;
  
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
        dataLabels: {
          offset: 40,
        },
        donut: {
          size: size,
          labels: {
            show: showLabelOnHover,
            name: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: '#373d3f',
              offsetY:-3,
              formatter: function (val) {
                return val
              }
            },
            value: {
              show: showLabelOnHover,
              fontSize: '14px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              color: "#525252",
              offsetY: 0,
              formatter: function (val) {
                return val
              }
            },
            total: {
              show: showLabelOnHover,
              showAlways: false,
              label: 'Total',
              fontSize: '18px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: '#071437',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a:number, b:number) => {
                  return a + b
                }, 0)
              }
            }
          }
        },   
      },
    },
    colors: ["#9A56D3","#FEBB68","#A3A3A3",'#444444'],
    dataLabels: {
      enabled: showDataLabels || false,
      formatter: function (value: number,opts) {
        const labels= opts.w.config.labels;
        const series= opts.w.config.series;
        return [series[opts.seriesIndex], labels[opts.seriesIndex]] as (unknown) as string;
      },
      style: {
        fontSize:'14px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 500,
        colors: ['#000000']
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
      }
    },
    fill: {
      opacity: 1,
    },
    labels: [...labels],
    legend: {
      show: legendOption?.show || true,
      position: legendOption?.position || "bottom",
      itemMargin: {
        horizontal: 10,
        vertical:5
      },
    },
    stroke: {
      width: 0,
    },
  };

  return (
    <Grid item xs={12} spacing={4}>
      <Chart
        height={height || 180}
        options={chartOptions}
        series={series}
        type="donut"
      />
    </Grid>
  );
}

export default DonutApexChart;
