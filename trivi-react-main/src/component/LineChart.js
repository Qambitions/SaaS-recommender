import React, { useEffect, useState} from "react";
import { ResponsiveLine } from "@nivo/line";
import { Box, useTheme, Select, MenuItem, Button} from "@mui/material";
import {  Form, InputGroup } from '@themesberg/react-bootstrap';
import { tokens } from "../theme";
import moment from "moment";
import { domainPath } from "../constants/utils";


const getRequiredDateFormat = (timeStamp, format = "YYYY-MM-DD") => {
  return moment(timeStamp).format(format);
};


const LineChart = ({isDashboard = false, diagram}) => {
  const username = localStorage.getItem('userName');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
     <>
     <ResponsiveLine
      data={diagram}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }} // added
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      // xFormat="time:%Y-%m-%d %H:%M:%S"
      // xScale={{ 
      //   type: "point",
      //   format: '%Y-%m-%d %H:%M:%S',
      //   useUTC: false,
      //   precision: 'month' 
      // }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.0f"
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickRotation: 15,
        legend: isDashboard ? undefined : "Time", // added
        legendOffset: 36,
        legendPosition: "middle",    
        // format: values => {
        //   const mth = values.slice(0,2).toString();
        //   console.log("value: ", mergedDataset, mth);
        //   if (mergedDataset.includes(mth)) {
        //     console.log("oke")
        //     setMergedDataset(mergedDataset.filter(item => item !== mth));
        //     return `${values}`;
        //   } else return "";
        format: values => {return ""}   
       
        // },   
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5, // added
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Count", // added
        legendOffset: -40,
        legendPosition: "middle",
      }}

      enableSlices="x"
      sliceTooltip={({ slice }) => {
        const date = slice.points[0].data.xFormatted;
        return (
          <div>
            <strong>
              {`Date: ${getRequiredDateFormat(date, "YYYY-MM-DD")}`}
            </strong>
            {slice.points.map(point => (
              <div key={point.id}>
                <strong style={{ color: point.serieColor }}>
                  {`${point.serieId} ${point.data.yFormatted}`}
                </strong>
              </div>
            ))}
          </div>
        );
      }}
      tooltipFormat={value => {
        // console.log("value: ", value);

        return value;
      }}




      enableGridX={false}
      enableGridY={false}
      pointSize={3}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
    </> 
  );
};

export default LineChart;
