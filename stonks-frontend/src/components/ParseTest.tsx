import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const ParseTest: React.FC = () => {
  const [series, setSeries] = useState<
    { data: { x: Date; y: [number, number, number, number] }[] }[]
  >([]);
  let ws: WebSocket | null = null; // Define ws outside the connect function

  useEffect(() => {
    const connect = () => {
      ws = new WebSocket("ws://localhost:6789");

      ws.onopen = () => {
        console.log("Connected to WebSocket");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data && Array.isArray(data)) {
          const barData = data[0];
          const [datePart, timePart] = barData.t.split("T");
          const [year, month, day] = datePart.split("-").map(Number);
          const timeP = timePart.split("Z")[0];
          const [hour, minute, second] = timeP.split(":").map(Number);
          const newBar = {
            x: new Date(year, month - 1, day, hour, minute, second),
            y: [barData.o, barData.h, barData.l, barData.c] as [
              number,
              number,
              number,
              number
            ],
          };

          // Update series with new data
          setSeries((prevSeries) => [
            {
              data: [...(prevSeries[0]?.data || []), newBar],
            },
          ]);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed, reconnecting...", event);
        setTimeout(connect, 1000); // Reconnect after 1 second
      };

      ws.onerror = (error) => {
        console.error("WebSocket error", error);
        ws?.close(); // Close the connection on error
      };
    };

    connect(); // Initiate WebSocket connection

    return () => {
      if (ws) {
        ws.close(); // Clean up WebSocket connection on component unmount
      }
    };
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      height: 350,
    },
    title: {
      text: "CandleStick Chart",
      align: "left",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={options}
          series={series}
          type="candlestick"
          height={350}
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default ParseTest;
