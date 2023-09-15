/*
 * @LastEditors: 刘各欢
 * @LastEditTime: 2023-09-15 16:06:10
 * @Description: 
 * 
 */
// https://lbs.amap.com/demo/javascript-api/example/poi-search/keywords-search  
// chrome console 切换frame


window.ResultArr = [];

function search(pageIndex, callbackFunc){
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
      callbackFunc(status, result);
    });
  
  });

}







// ---------------------------------------------------------------------------------










// 手动执行  多次 
// TODO promise
  search(1,(status, result)=>{
    ResultArr.push(result);
  })

  search(2,(status, result)=>{
    ResultArr.push(result);
  })


var finalResult = []

ResultArr.forEach(v =>{
  if(v.info == 'OK' && v.poiList && v.poiList.pois && v.poiList.pois.length){
    v.poiList.pois.forEach(vv =>{
      const { name,tel, address, adname,type, id } = vv;
      finalResult.push({ name, tel, address, adname,type, id })
    });
  }
  
})

return finalResult;


//  json to csv
// https://jsonformatter.net/json-to-csv/
