import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Papa from "papaparse";

/*
  const series = [
    {
      data: [
        {
          x: new Date(2016, 1, 1, 12, 35, 0),
          y: [51.98, 56.29, 51.59, 53.85],
        },
        {
          x: new Date(2016, 1, 1, 12, 36, 0),
          y: [53.66, 54.99, 51.35, 52.95],
        },
        {
          x: new Date(2016, 1, 1, 12, 37, 0),
          y: [52.76, 57.35, 52.15, 57.03],
        },
      ],
    },
  ];
*/
const CandlestickChart = () => {
  const [series, setSeries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("../../../bars.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ERROR BOT! ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        console.log("CSV Data: ", data);
        Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          delimiter: ",",
          dynamicTyping: true,
          complete: (results) => {
            console.log("Parsing results", results);
            const formattedData = results.data
              .map((row: any) => {
                // Check if the timestamp exists and is not empty
                if (row.timestamp) {
                  const [datePart, timePart] = row.timestamp.split(" ");
                  const [year, month, day] = datePart.split("-").map(Number);
                  const timeP = timePart.split("+")[0];
                  const [hour, minute, second] = timeP.split(":").map(Number);

                  return {
                    x: new Date(year, month - 1, day, hour, minute, second), // Corrected date format
                    y: [
                      parseFloat(row.open),
                      parseFloat(row.high),
                      parseFloat(row.low),
                      parseFloat(row.close),
                    ],
                  };
                } else {
                  // Handle rows with missing or invalid timestamps
                  return null; // or provide a default value
                }
              })
              .filter(Boolean); // Filter out null values

            setSeries([{ data: formattedData }]);
          },
          error: (error: Error) => {
            setError(`Error parsing CSV: ${error.message}`);
          },
        });
      })
      .catch((error) => {
        setError(`Error fetching data: ${error.message}`);
      });
  }, []);

  const [options] = useState<ApexOptions>({
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
  });

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

export default CandlestickChart;
