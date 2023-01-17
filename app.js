//* ------------------------ 1.  fetch() from local file, Promises & async function -------------------------------//
//--------  fetch from local file example -------------//
console.log("test test");

// then() is a Promises method
// catch() is a Promises method for errors
// fetch("./rainbow.png")
//   .then((response) => {
//     console.log(response);
//     return response.blob(); // step 3: turn data into image
//   })
//   .then((blob) => {
//     document.getElementById("rainbow").src = URL.createObjectURL(blob); // turn blob image into url for src
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// ------then() can be replced by async function  ---------//

// Call the function
fetchImg().catch((error) => {
  console.error(error);
});

async function fetchImg() {
  const response = await fetch("./rainbow.png");
  const blob = await response.blob();
  document.getElementById("rainbow").src = URL.createObjectURL(blob);
}

//* ------------------------ 2.  parsing csv file and graphing with Chart.js -------------------------------//

// Parsing data
// let file = "test_file.csv";
let file = "ZonAnn.Ts+dSST.csv";
const myData = [];

// ---------- Graphing -------------

async function graphIt() {
  //? graphIt() waits untill getCSV() finished to run the rest of function
  await getCSV();

  new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: myData.map((row) => row.xYear),
      datasets: [
        {
          label: "Global Temperature Mean Deviations",
          data: myData.map((row) => row.yTemp),
          borderColor: "rgb(75, 192, 192)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
  //   console.log("graphing running");
}

// ---------- Fetching & parsing CSV -------------
async function getCSV() {
  const response = await fetch(file);
  const tableData = await response.text();
  //   console.log(tableData);

  //? Although there are many libiary can parse csv files, here we try to work on that manually:
  //? 1. split by row and remove 1st row (the tags); 2. pick out first two data in each row

  const row = tableData.split("\n").slice(1); // \n is the line breaker; slice(1) removes the first element
  //   console.log(row);

  row.forEach((row) => {
    line = row.split(",");
    const year = Number(line[0]);
    const temp = Number(line[1]);
    // console.log(typeof year); Convert year and temp to number for the chart
    myData.push({ xYear: year, yTemp: temp });
  });
  //   console.log(myData);
}

graphIt();

//* ------------------------ 3.  Fetching ISS API & pointing it on the map -------------------------------//

const issApiUrl = "https://api.wheretheiss.at/v1/satellites/25544";

// --------- Map setting ------------//
const map = L.map("iss-map").setView([0, 0], 3);
const issIcon = L.icon({
  iconUrl: "satellite.png",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});
const marker = L.marker([0, 0], { icon: issIcon }).addTo(map);

// Add map tiles
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// ----------- Fetch API & map adjust function ------ //
async function getIssApi() {
  const response = await fetch(issApiUrl);
  const issData = await response.json();
  //   console.log(issData);
  const { latitude, longitude } = issData;
  document.querySelector(".cor").textContent = `${latitude.toFixed(
    2
  )}, ${longitude.toFixed(2)}`;

  map.setView([latitude, longitude]);
  marker.setLatLng([latitude, longitude]);
}

getIssApi(); // Call function when the page loads, setInterval will wait 1500ms to call
setInterval(getIssApi, 1500);
