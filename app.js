// express 모듈 셋팅
const express = require('express')

const app = express()
app.listen(6666)

// 쉽게 말해 미들웨어를 만든 것 -> use 이용해 써야겠다고 말만하면 됨
const userRouter = require('./routes/users') // user-demo 소환
const channelRouter = require('./routes/channels') // channel-demo 소환

app.use("/", userRouter)
app.use("/channels", channelRouter)


let test = "test1"
console.log(Boolean(+test))