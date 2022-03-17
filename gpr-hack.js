const { writeFileSync, readFileSync } = require('fs');

const file = readFileSync("./package.json", {
  encoding: "utf-8",
});

const json = JSON.parse(file);

json.name = "@mike-han/react-webpack-typescript-boilerplate";

writeFileSync("./package.json", JSON.stringify(json, undefined, 2));
