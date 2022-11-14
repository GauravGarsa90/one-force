const data = require("./data.json")

console.log(Array.from(new Set(data.map(d => d.gender))))
