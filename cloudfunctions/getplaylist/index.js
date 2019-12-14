// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//数据库初始化
const db = cloud.database()
const rp = require('request-promise');
const URL = 'http://musicapi.xiecheng.live/personalized'
// const URL = 'http://127.0.0.1:3000/mv/exclusive/rcmd'

const playlistCollection = db.collection('playlist')
const newDataCollection = db.collection('newData')


// 云函数入口函数
exports.main = async (event, context) => {
  //取到数据库里所有的数据  云函数在获取数据时最多获取到100条
  // 如果在小程序中获取数据最多获取20条
  // list是获取服务器的数据
  //playlistCollection.get()只能获得100条数据
  const list = await playlistCollection.get()
  // //获取的总的数据条数
  // playlistCollection.count()
  
  const p = await rp(URL)
   // playlist是获取的数据
  const playlist = JSON.parse(p).result 
  // console.log(playlist)
  const newData = []
  for(let i =0;i<playlist.length;i++) {
    //设置标识位
    let flag = true
    for(let j=0;j<list.length;j++) {
      if(playlist[i].id === list[j].id) {
        //标识位变为false
        flag = false
        // break 语句跳出循环后，会继续执行该循环之后的代码（如果有的话）：
        break
      }
    }
    if(flag) {
      newData.push(playlist[i])
    }
  }


  for (let i = 0; i < newData.length;i++) {
    //数据库插入是异步
    await newDataCollection.add({
      data:{
        ...newData[i],
        createTime:db.serverDate(),
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.log('插入失败')
    })
  }

}