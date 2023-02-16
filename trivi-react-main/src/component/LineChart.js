import React, { useEffect, useState} from "react";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import moment from "moment";
import { domainPath } from "../constants/utils";



const LineChart = ({ isDashboard = false }) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const username = localStorage.getItem('userName');

  const [diagram, setDiagram] = useState([
    {
      id: "",
      color:"",
      data: [{
        x:"",
        y:""
      }]
    }
  ])


  const changeFormat = (data) => {
    var result = [];
    var colors = [tokens("dark").blueAccent[300], tokens("dark").greenAccent[500], tokens("dark").redAccent[200], tokens("dark").grey[200], tokens("dark").primary[200] ]
    var id = ["Add to cart", "Click", "Login", "Remove from cart", "View"]
    var id1 = ["AddToCart", "Click", "Login", "RemoveFromCart", "View"]


    for(var i=0;i<5;i++)
    {
        var iData = [];
        for (var j=0; j<data[id[i]].counts.length; j++){
          iData[iData.length] = {
            "x":  moment(data[id[i]].created_at[j]).format("YYYY/MM/DD"),
            "y": data[id[i]].counts[j]
          }
        }
        result[result.length] = {  
            "id" : id1[i],
            "color": colors[i],
            "data": iData
        }; 
    }
      return result;
  }

  const fetchDiagram = async() => {
    const url = domainPath + "dimadb/get-diagram-data/?username="+username;
    const result = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())
    .then((data) => {
      console.log("Diagram 1 : ", changeFormat(data.message))
      setDiagram(changeFormat(data.message))
      return data;
    }).catch((err) => console.log(err));

  }

  useEffect(() => {   
    fetchDiagram().catch(console.error);

    }, []);

  return (
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
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Time", // added
        legendOffset: 36,
        legendPosition: "middle",
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
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
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
  );
};

export default LineChart;
