const cheerio = require("cheerio");
const axios = require("axios");


/**
 * Retrieve FanFiction
 * @param {string} url - Url of the FanFiction
 */

const getTales = async (url) => {
  let promises = [];

  let fanfictionData = {};

  let counter = 0;

  // Retrieve the fanfiction data before proceeding.
  let promise = await axios.get(`${url}/1`).then((response) => {
    const $ = cheerio.load(response.data);

    const profileElement = $("#profile_top"),
      thumbnail = profileElement.find("img").attr("src"),
      title = profileElement.find("b").text(),
      author = profileElement.find("a[href*='/u/']").text(),
      description = profileElement.find("div").text(),
      metadata = profileElement.find("span.xgray").text().split("-").map(data => data.trim()),
      chapters = $("#chap_select").eq(0).children().length;

    fanfictionData.thumbnail = thumbnail;
    fanfictionData.title = title;
    fanfictionData.author = author;
    fanfictionData.description = description;
    fanfictionData.metadata = metadata;
    fanfictionData.chapters = chapters;
  });

  // Loop through all chapters.
  for (let i = 0; i < fanfictionData.chapters; i++) {
    let promise = axios.get(`${url}/${i + 1}`).then((response) => {
      const $ = cheerio.load(response.data);
      
      /**
       * Parse through the texts.
       */
      let chapterContents = []

      let textElements = $(".storytext p");

      for (let i = 0, textElementsLength = textElements.length; i < textElementsLength; i++) {
        chapterContents.push(textElements.eq(i).html());
      }

      return {
        page: i + 1,
        content: chapterContents
      };
    });

    promises.push(promise);
  }

  return Promise.all(promises).then((res) => {
    fanfictionData.story = res;

    console.log(fanfictionData);
  });
}