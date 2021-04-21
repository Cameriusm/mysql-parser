const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

app.use(cors());
app.use(express.json());

function checkCategories(categories) {
  const url = [];
  if (categories.includes('News'))
    url.push('https://www.emkafashion.ru/catalog/new/filter/odezda-is-ubki/');
  if (categories.includes('Jackets'))
    url.push('https://www.emkafashion.ru/catalog/kurtki-rubashechnogo-kroya/');
  if (categories.includes('Outerwear'))
    url.push('https://www.emkafashion.ru/catalog/verkhnyaya_odezhda_optom/');
  if (categories.includes('Vests'))
    url.push('https://www.emkafashion.ru/catalog/zhaketi_zhilety_optom/');
  if (categories.includes('Blouses'))
    url.push('https://www.emkafashion.ru/catalog/bluzki_optom/');
  if (categories.includes('Shirts'))
    url.push('https://www.emkafashion.ru/catalog/futbolki-khudi-svitshoty/');
  if (categories.includes('Sweater'))
    url.push('https://www.emkafashion.ru/catalog/svitery-vodolazki/');
  if (categories.includes('Dresses'))
    url.push('https://www.emkafashion.ru/catalog/platya_optom/');
  if (categories.includes('Pants'))
    url.push('https://www.emkafashion.ru/catalog/bruki_optom/');
  if (categories.includes('Skirts'))
    url.push('https://www.emkafashion.ru/catalog/ubki_optom/');
  if (categories.includes('Accessories'))
    url.push('https://www.emkafashion.ru/catalog/remni_optom/');
  if (categories.includes('Shoes'))
    url.push('https://www.emkafashion.ru/catalog/obuv/');
  return url;
}

app.post('/api/post', (req, res) => {
  const categories = req.body.categories;
  const urls = checkCategories(categories);
  console.log(urls);
  const resUrl = urls.map((url) => {
    return axios(url)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);
        const links = $('.sm_name_stickers a[href]');
        const parsedLinks = [];
        links.each(function () {
          const href = $(this).attr('href');
          parsedLinks.push({
            href,
          });
        });

        return parsedLinks;
      })
      .catch(console.error);
  });
  Promise.all(resUrl).then(function (result) {
    const mergedResUrl = [].concat.apply([], result);
    const parsedProducts = mergedResUrl.map((url) => {
      return axios('https://www.emkafashion.ru' + url.href)
        .then((response) => {
          const html = response.data;
          const $ = cheerio.load(html);
          const links = $('.cat-det.js--fix-head');
          const parsedLinks = [];
          links.each(function () {
            const articul = $(this).find('.cat-det-articul').text();
            const img = $(this)
              .find(
                '.cat-det-images-slider__item.swiper-slide.swiper-slide-active.swiper-slide-duplicate-next.swiper-slide-duplicate-prev'
              )
              .find('img')
              .attr('src');
            const name = $(this).find('.cat-det-name').text();
            const description = $(this).find('.cat-det-descr').text();
            const descList = $(this)
              .find('.cat-det-descr-list')
              .text()
              .trim()
              .replace(/\s\s+/g, ' ');
            parsedLinks.push({
              articul,
              name,
              description,
              descList,
              img,
            });
          });

          return parsedLinks;
        })
        .catch(console.error);
      // console.log(mergedResUrl);
    });
    Promise.all(parsedProducts).then(function (result) {
      res.send(result);
    });
  });
  // console.log(resUrl);

  console.log('bruh');
});

const PORT = 3001;

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
