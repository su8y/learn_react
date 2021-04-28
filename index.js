const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser');
const {User} = require('./models/User');
const config = require('./config/key');
//데이터를 aplicatoin형태로 가져오게함
app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
  useNewUrlParser: true, useUnifiedTopology: true,
  useCreateIndex: true, useFindAndModify: false
}).then(()=> console.log('MongoDB Connected....'))
.catch(err => console.log(err))



app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.post('/register',(req,res) => {  
//회원가입할때 필요한 정보들을 client에서 가져오기 데이터 베이스에 넣어주기  
  const user = new User(req.body);
  user.save((err,doc)=>{
    if(err) return res.json({success:false,err})
    return res.status(200).json({
      success: true
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})