const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const axios = require('axios');

const url =
  'https://www.emkafashion.ru/catalog/verkhnyaya_odezhda_optom/r082_beetn/';
app.use(cors());
app.use(express.json());
axios(url)
  .then((response) => {
    const html = response.data;
    console.log(html);
  })
  .catch(console.error);
const PORT = 3001;

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on porn ${PORT}`);
});
