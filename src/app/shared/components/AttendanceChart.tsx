import { useEffect, useRef, FC } from "react";
import ApexCharts, { ApexOptions } from "apexcharts";
import { Card, Grid, Stack, Typography } from "@mui/material";
import { getCSSVariableValue } from "../../../_themes/assets/ts/_utils";
import { useIntl } from "react-intl";
import { CustomCard } from "./CustomCard";

type Props = {
  className: string;
  chartColor: string;
  chartHeight: string;
};

const AttendanceChart: FC<Props> = ({ className, chartColor, chartHeight }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const intl = useIntl();
  const refreshChart = () => {
    if (!chartRef.current) {
      return;
    }

    const chart1 = new ApexCharts(
      chartRef.current,
      chart1Options(chartColor, chartHeight)
    );
    if (chart1) {
      chart1.render();
    }

    return chart1;
  };

  useEffect(() => {
    const chart1 = refreshChart();

    return () => {
      if (chart1) {
        chart1.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef]);

  return (
    <CustomCard label={intl.formatMessage({ id: "PAGE.ATTENDANCE" })}>
      <Stack
        direction={"row"}
        spacing={8}
        display={"flex"}
        justifyContent={"flex-start"}
        mt={1}
      >
        <Stack>
          <Typography variant="body2">
            {intl.formatMessage({ id: "ATTENDANCE.PRESENT" })}
          </Typography>
          <Typography variant="h6">185</Typography>
        </Stack>
        <Stack>
          <Typography variant="body2">
            {intl.formatMessage({ id: "ATTENDANCE.ABSENT" })}
          </Typography>
          <Typography variant="h6">16</Typography>
        </Stack>
        <Stack>
          <Typography variant="body2">
            {intl.formatMessage({ id: "ATTENDANCE.LATE" })}
          </Typography>
          <Typography variant="h6">9</Typography>
        </Stack>
      </Stack>
      <Stack ref={chartRef} className="mixed-widget-5-chart card-rounded-top" />
    </CustomCard>
  );
};

const chart1Options = (
  chartColor: string,
  chartHeight: string
): ApexOptions => {
  const labelColor = getCSSVariableValue("--bs-gray-800");
  const strokeColor = getCSSVariableValue("--bs-gray-300");
  const baseColor = getCSSVariableValue("--bs-" + chartColor) as string;
  const lightColor = getCSSVariableValue("--bs-" + chartColor + "-light");

  return {
    series: [
      {
        name: "Present days",
        data: [23, 16, 23, 20, 22, 22],
      },
    ],
    chart: {
      fontFamily: "inherit",
      type: "area",
      height: chartHeight,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {},
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "solid",
      opacity: 1,
    },
    // fill1: {
    //   type: 'gradient',
    //   opacity: 1,
    //   gradient: {
    //     type: 'vertical',
    //     shadeIntensity: 0.5,
    //     gradientToColors: undefined,
    //     inverseColors: true,
    //     opacityFrom: 1,
    //     opacityTo: 0.375,
    //     stops: [25, 50, 100],
    //     colorStops: [],
    //   },
    // },
    stroke: {
      curve: "smooth",
      show: true,
      width: 3,
      colors: [baseColor],
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
        style: {
          colors: labelColor,
          fontSize: "12px",
        },
      },
      crosshairs: {
        show: false,
        position: "front",
        stroke: {
          color: strokeColor,
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: true,
        formatter: undefined,
        offsetY: 0,
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 24,
      labels: {
        show: false,
        style: {
          colors: labelColor,
          fontSize: "12px",
        },
      },
    },
    states: {
      normal: {
        filter: {
          type: "none",
          value: 0,
        },
      },
      hover: {
        filter: {
          type: "none",
          value: 0,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "none",
          value: 0,
        },
      },
    },
    tooltip: {
      style: {
        fontSize: "12px",
      },
      y: {
        formatter: function (val) {
          return val + " days";
        },
      },
    },
    colors: [lightColor],
    markers: {
      colors: [lightColor],
      strokeColors: [baseColor],
      strokeWidth: 3,
    },
  };
};

export { AttendanceChart };
