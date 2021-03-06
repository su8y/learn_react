const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const {auth} = require('./middlieware/auth');
const {User} = require('./models/User');

//데이터를 aplicatoin형태로 가져오게함
app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
  useNewUrlParser: true, useUnifiedTopology: true,
  useCreateIndex: true, useFindAndModify: false
})
  .then(()=> console.log('MongoDB Connected....'))
  .catch(err => console.log(err))



app.get('/', (req, res) => { res.send('Helllo World!') })

app.get('/api/hello', (req,res)=>{

  res.send('hello world!');
})

app.post('/api/users/register',(req,res) => {  
//회원가입할때 필요한 정보들을 client에서 가져오기 데이터 베이스에 넣어주기  
  const user = new User(req.body);

  user.save((err,doc)=>{
    if(err) return res.json({success:false,err})
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login',(req,res)=>{
  //요청된 이메일을 데이터베이스에서 있는지 찾는다
  User.findOne({email : req.body.email },(err,user)=>{      
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일이 없습니다"
      })
    }

    //요청된 이메일의 비밀번호가 맞는지 확인 
    user.comparePassword(req.body.password , (err,isMatch)=>{        
      if(!isMatch) return res.json({ loginSuccess:false,message:"비밀번호가틀렸습니다"})
      
      //비밀번호까지 같다면 토큰을 생성
      user.generateToken((err, user)=> {
        if(err) return res.status(400).send(err);
  
        // 토큰을 저장한다 , 쿠키 , 로컬스토리지
        res
            .cookie("x_auth",user.token)  
            .status(200)
            .json({loginSuccess: true, userId: user._id})
      }) 
    }) 
  }) 
})
//Router <-express
app.get('/api/users/auth',auth,(req,res)=>{

  res.status(200).json({
    _id : req.user._id,
    isAdmin : req.user.role === 0 ? false : true,
    isAuth : true,
    email : req.user.email,
    name : req.user.name,
    lastName : req.user.lastName,
    role : req.user.role,
    image : req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.users._id },
    { token: "" },
    (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      })
    }
  )
})

const port = 5000;

app.listen(port, () => { console.log(`Example app listening at http://localhost:${port}`) })
//loader:O926 error fixed
//package.json 에서 script를 변경해준다 삭제후재설치도 좋은방법