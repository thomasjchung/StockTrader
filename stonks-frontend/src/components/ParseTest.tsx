import { useEffect } from "react";
import Papa from "papaparse";

const ParseTest = () => {
  useEffect(() => {
    fetch("/bars.csv")
      .then((response) => {
        console.log("Response success");
        return response.text();
      })
      .then((data) => {
        Papa.parse(data, {
          header: true,
          complete: (results) => {
            console.log("Results", results);
            results.data.map((row: any) => {
              console.log("Open", row.open);

              return;
            });
          },
        });
      });
  }, []);

  return <div>Hello</div>;
};

export default ParseTest;
