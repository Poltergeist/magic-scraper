const request = require("request");
const fs = require("fs");

const getUrl = (page = 0) =>
  `https://magic.wizards.com/en/see-more-wallpaper?page=${page}&filter_by=ASC`;

function requestPage(url) {
  request.get(url, function(error, response, body) {
    console.log(error);
    const { data, status, page, displaySeeMore } = JSON.parse(body);
    let results = data.match(/https:\/\/[A-Za-z0-9.\/\?/=\-\&\_]*/g);
    results = results
      .reduce(
        (memo, item) => (memo.includes(item) ? memo : [...memo, item]),
        []
      )
      .reduce((memo, item) => {
        let size = item.match(/(\d*)x(\d*)/g);
        if (size == null) {
          return { ...memo, [item]: { size, item } };
        }
        size = size
          .join("")
          .split("x")
          .reduce((a, b) => a * b, 1);

        console.log(item, item.match(/.*(?=_\d*[xX]\d*)/g));
        let name = item.match(/.*(?=[-_]\d*[xX]\d*)/g);
        name = name && name[0];
        return name != null && memo[name] && memo[name] > size
          ? { ...memo }
          : { ...memo, [name]: { size, item } };
      }, {});
    Object.values(results).forEach(({ item }) => {
      console.log(item);
      request
        .get(item)
        .on("error", function(err) {
          console.log(err);
        })
        .pipe(
          fs.createWriteStream(`downloads/${item.split("/").slice(-1)[0]}`)
        );
    });

    if (displaySeeMore === 1) {
      console.log(`Requesting page ${page} in 5 sec.`);
      setTimeout(() => requestPage(getUrl(page)), 5000);
    }
    console.log(`Status: ${status}`);
    console.log(`finished Page: ${page}`);
    console.log(`More: ${displaySeeMore}`);
  });
}

requestPage(getUrl());
