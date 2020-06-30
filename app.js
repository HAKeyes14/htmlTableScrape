const puppeteer = require("puppeteer");
const fs = require("fs");

const URL = "http://www.avcodes.co.uk/acrtypes.asp";

async function scrapeTable() {
  let browser = await puppeteer.launch({ headless: false });
  let page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle0" });

  let data = await page.evaluate(() => {
    let tablesArray = Array.from(document.querySelectorAll("tbody"));

    const tables = tablesArray.map((table) => {
      const tableHTML = table.innerHTML;
      const rows = tableHTML.split(/<tr>|<\/tr>/);
      rows.shift();
      const filteredRows = rows.filter((row) => !row.includes("\n"));
      //return filteredRows;
      const entries = filteredRows.map((row) => {
        const entryArray = row.split(/<td>/);
        entryArray.shift();
        const filteredEntries = entryArray.map((entry) => {
          let formattedEntry = entry.trim();
          if (formattedEntry.substr(0, 2) === "\t") {
            formattedEntry = formattedEntry.slice(2);
          }
          formattedEntry = formattedEntry.replace("</td>", "");
          if (formattedEntry.substr(-1) === "\t") {
            formattedEntry = formattedEntry.slice(0, -1);
          }
          return formattedEntry;
        });
        return filteredEntries;
      });
      return entries;
    });

    return tables.filter((table, i) => i > 2).flat();
  });

  console.log(data);

  const aircraftData = {
    aircraft: data.map((plane) => {
      return {
        IATA: plane[0],
        ICAO: plane[1],
        "Manufacturer/Type": plane[2],
      };
    }),
  };

  await browser.close();
  return JSON.stringify(aircraftData);
}

scrapeTable().then((data) => {
  fs.writeFile("aircraftData.json", data, (err) => {
    if (err) {
      console.log(er);
    }
  });
});
