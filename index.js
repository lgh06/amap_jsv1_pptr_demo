/*
 * @LastEditors: 刘各欢
 * @LastEditTime: 2023-09-15 17:21:48
 * @Description: 
 * 
 */

const puppeteer = require('puppeteer-core');

const child_process = require('child_process');

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.get("/t", (req, res) => {

  (async () => {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
      headless: false,
      // slowMo: 250,
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1440,
        height: 810,
      },
      args: [
        '--disable-dev-shm-usage',
        '--disable-infobars',
        '--window-size=1440,810',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--disable-extensions',
        '--no-first-run',
        '--disable-notifications',
      ],
      ignoreDefaultArgs: ['--enable-automation']
    });
    const page = await browser.newPage();
    await page.goto('https://lbs.amap.com/demo/javascript-api/example/poi-search/keywords-search', {
      waitUntil: 'networkidle2'
    });


    await page.waitForFrame(async frame => {
      return frame.$(".amap-pancontrol");
    })


    const frame = page.frames().find(frame => frame.url() === 'https://lbs.amap.com/site/blank');
    page.frames().forEach(v =>{
      console.log(v.name(), v.url(), v._id);
    })
    if (frame) {
      console.log(frame.url(), page.frames().length)
      await frame.waitForSelector("#panel");
      await frame.waitForFunction('window.AMap !== undefined')

      // frameResult 是promise resolve之后的结果
      let frameResult = await frame.evaluate(() => {

        // search 返回的是一个promise
        function search(pageIndex) {
          return new Promise((resolve, reject) => {
            AMap.service(["AMap.PlaceSearch"], function () {
              //构造地点查询类
              var placeSearch = new AMap.PlaceSearch({
                pageSize: 50, // 单页显示结果条数
                pageIndex, // 页码
                city: "410725", // 兴趣点城市
                citylimit: true,  //是否强制限制在设置的城市内搜索
                map: map, // 展现结果的地图实例
                panel: "panel", // 结果列表将在此容器中进行展示。
                autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
              });
              //关键字查询
              placeSearch.search('火锅', (status, result) => {
                resolve({ status, result });
              });

            });
          });


        }

        // async 函数
        async function mainFunc() {
          window.ResultArr = [];

          for await (i of [1, 2]) {
            const { status, result } = await search(i);
            ResultArr.push(result);
          }



          var finalResult = []

          ResultArr.forEach(v => {
            if (v.info == 'OK' && v.poiList && v.poiList.pois && v.poiList.pois.length) {
              v.poiList.pois.forEach(vv => {
                const { name, tel, address, adname, type, id } = vv;
                finalResult.push({ name, tel, address, adname, type, id })
              });
            }

          })

          return finalResult;

        }
        return mainFunc();

      });
      res.send(frameResult)
      await browser.close()

    }

  })();
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  child_process.execSync(`start http://localhost:${port}/t`)
})