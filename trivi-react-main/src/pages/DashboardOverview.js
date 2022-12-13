import React, { useEffect, useState, useContext } from "react";
import { faCashRegister, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Card } from "@themesberg/react-bootstrap";
import { faDesktop, faMobileAlt, faTabletAlt } from '@fortawesome/free-solid-svg-icons';


import { CounterWidget, CircleChartWidget } from "../components/Widgets";
import { PageVisitsTable } from "../components/Tables";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { TabTitle } from "../constants/generalFunctions";
import { AppContext } from "./AppContext";

require("highcharts/modules/exporting")(Highcharts);
require("highcharts/modules/export-data.js")(Highcharts);

export default () => {
  TabTitle("Tableaux de bord");

  const {fetchRequest} = useContext(AppContext);
  const [charts, setCharts] = useState([]);
  const [webActivities, setWebActivities] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [traffic, setTraffic] = useState({});
  const [pages, setPages]= useState([]);

  const createChart = (title, chartData, chartType) => {
    return {
      title: {
        text: title ? title : "",
        margin: 20,
        style: {
          fontSize: "1.25rem",
          color: "#262B40",
        },
      },
      chart: {
        type: chartType ? chartType : "line",
        style: {
          fontFamily: "Nunito Sans",
        },
      },
      series: chartData
        ? [
            {
              name: "Total",
              data: chartData,
              colorByPoint: true,
            },
          ]
        : [],
      exporting: {
        enabled: true,
        showTable: false,
      },
      xAxis: {
        type: "category",
      },
      yAxis: {
        title: {
          text: "value",
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
          },
          showInLegend: true,
        },
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.percentage:.1f} %",
          },
        },
      },
      options: {
        charts: {
          style: {
            fontFamily: "Nunito Sans",
          },
        },
      },
    };
  };

  const trafficShares = (data) => {
    const desktop = data['desktop'] ? data['desktop'] : 0;
    const mobile = data['mobile'] ? data['mobile'] : 0;
    const tablet = data['tablet'] ? data['tablet'] : 0;
    var sum = desktop + mobile + tablet;
    if (sum == 0)
      sum = 1
      
    return [
      { id: 1, label: "Desktop", value: (desktop*100/sum).toFixed(0) || 0, color: "secondary", icon: faDesktop },
      { id: 2, label: "Mobile Web", value: (mobile*100/sum).toFixed(0) || 0, color: "primary", icon: faMobileAlt },
      { id: 3, label: "Tablet Web", value: (tablet*100/sum).toFixed() || 0, color: "tertiary", icon: faTabletAlt }
    ]
  };

  useEffect(() => {
    fetchRequest("dimadb/home/", 'GET')
    .then((data) => {
      if (data != undefined) {
        var listCharts = data.reports.map((chart, index) => {
          var newChart = createChart(chart.title, chart.data, chart.type);
          return newChart;
        });
        setCharts(listCharts);
        setWebActivities(data.webActivities);
        setSessions(data.sessions);
        setTraffic(data.traffic);
        setPages(data.pages);
      }
    }).catch((err) => alert(err));
  }, []);

  return (
    <>
      <Row className="mt-3 justify-content-md-center">
        <Col xs={12} sm={6} xl={4} className="mb-4">
          <CounterWidget
            title={`${sessions} Sessions Web`}
            period="All time"
            icon={faChartLine}
            iconColor="shape-secondary"
          />
        </Col>
        <Col xs={12} sm={6} xl={4} className="mb-4">
          <CounterWidget
            title={`${webActivities} Activités Web`}
            period="All time"
            icon={faCashRegister}
            iconColor="shape-tertiary"
          />
        </Col>

        <Col xs={12} sm={6} xl={4} className="mb-4">
          <CircleChartWidget title="Trafic Web" data={trafficShares(traffic)} />
        </Col>
        {charts.map((chart, index) => (
          <Col xs={12} xl={6} sm={6} className="mb-4" key={index}>
            <Card
              border="light"
              className="shadow-sm"
              style={{ overflow: "hidden" }}
            >
              <HighchartsReact highcharts={Highcharts} options={chart} />
            </Card>
          </Col>
        ))}
        <Col xs={12} xl={6} sm={6} className="mb-4">
          <PageVisitsTable pages={pages}/>
        </Col>
      </Row>
    </>
  );
};
