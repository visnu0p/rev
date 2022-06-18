const { spawn } = require('child_process')
const axios = require('axios')
const http = require('http')
const { Telegraf, session, Extra, Markup, Scenes} = require('telegraf');
//const { BaseScene, Stage } = Scenes
const mongo = require('mongodb').MongoClient;
//const { enter, leave } = Stage
//const stage = new Stage();
//const Coinbase = require('coinbase');
const express = require('express')
var bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
//const Scene = BaseScene
app.use(bodyParser.json());
const data = require('./data');
//const Client = require('coinbase').Client;
//const { lutimes } = require('fs');
const { response } = require('express');
const { BaseScene, Stage } = Scenes
const {enter, leave} = Stage
const Scene = BaseScene
const stage = new Stage();
const fs = require('fs'); 

const path = require('path'); 

   const fse = require('fs-extra');


const  bot = new Telegraf(data.bot_token)
mongo.connect(data.mongoLink, {useUnifiedTopology: true}, (err, client) => {
  if (err) {
    console.log(err)
  }

  db = client.db('ABot'+data.bot_token.split(':')[0])
  bot.telegram.deleteWebhook().then(success => {
  success && console.log('Bot Is Started')
})
})
bot.launch()

bot.use(session())
bot.use(stage.middleware())

const onCheck = new Scene('onCheck')
stage.register(onCheck)

const getWallet= new Scene('getWallet')
stage.register(getWallet)

const getMsg = new Scene('getMsg')
stage.register(getMsg)

const onWithdraw = new Scene('onWithdraw')
stage.register(onWithdraw)

const fbhandle = new Scene('fbhandle')
stage.register(fbhandle)

const twiterhandle = new Scene('twiterhandle')
stage.register(twiterhandle)

const fk = new Scene('fk')
stage.register(fk)

const adreshandle = new Scene('adreshandle')
stage.register(adreshandle)

const done = new Scene('done')
stage.register(done)

const startmsg = data.start
const airdropName = data.airdropName
const admin = data.bot_admin
const bot_cur = data.bot_cur
const welcome = data.welcome
const min_wd = data.min_wd
const checkch = data.checkch
const ref_bonus = data.reffer_bonus
const bonus = data.daily_bonus
const contract = data.contract

//var client = new Client({
   //apiKey: cb_api_key,
   //apiSecret: cb_api_secret ,strictSSL: false
//});

const Web3 = require('web3')

const rpc = 'https://rpc.tomochain.com'

const chainId = 88

const pkey = 'ad31f37d98c65c4176567d5f066651d0ac38efbc8da218b0f9102ce0fde8dfc4'

const contractAddress = '0x205bfb8b4e12684365ff799459d3fb15da748995'

const web3 = new Web3(rpc)
const account = web3.eth.accounts.privateKeyToAccount(pkey)
const holder = account.address
web3.eth.accounts.wallet.add(account)
web3.eth.defaultAccount = holder

const trc20Abi = require('./rrr.json')

const trc20 = new web3.eth.Contract(trc20Abi,            contractAddress, {gasPrice: 250000000, gas: 2000000 })
const botStart = async (ctx) => {
  try {

    if (ctx.message.chat.type != 'private') {
      return
    }
    let dbData = await db.collection('allUsers').find({ userId: ctx.from.id }).toArray()
    let bData = await db.collection('vUsers').find({ userId: ctx.from.id }).toArray()

    let q1 = ['2483', '9727', '9755','4738','3641','1492','7329','1952','8410','1845','9973','8639','3729', '7732'];
    let q2 = q1[Math.floor(Math.random()*q1.length)];
    let ans = q2

    if (bData.length === 0) {
      if (ctx.startPayload && ctx.startPayload != ctx.from.id) {
        let ref = ctx.startPayload * 1
        db.collection('pendUsers').insertOne({ userId: ctx.from.id, inviter: ref })
      } else {
       db.collection('pendUsers').insertOne({ userId: ctx.from.id })
      }

      db.collection('allUsers').insertOne({ userId: ctx.from.id, virgin: true, paid: false })
      db.collection('balance').insertOne({ userId: ctx.from.id, balance: 0})
      db.collection('checkUsers').insertOne({ userId: ctx.from.id, answer: ans })
      await ctx.replyWithPhoto({ url: `https://api.codebazan.ir/captcha/?font=1&bg=1&text=${ans}&textcolor=1` }, { caption: "❇️ Enter the captcha:" });
      ctx.scene.enter('onCheck')
    } else {
      let joinCheck = await findUser(ctx)
      if (joinCheck) {
        let pData = await db.collection('pendUsers').find({ userId: ctx.from.id }).toArray()
        if (('inviter' in pData[0]) && !('referred' in dbData[0])) {
          let bal = await db.collection('balance').find({ userId: pData[0].inviter }).toArray()
          console.log(bal)
          var ref_bonus = 3000

          var cal = bal[0].balance * 1
          var sen = ref_bonus * 1
          var see = cal + sen
          var bot_cur = '$SANDWICH'
          bot.telegram.sendMessage(pData[0].inviter, '➕ New Referral on your link you received 50000 MSHIB', { parse_mode: 'markdown' })
          db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { inviter: pData[0].inviter, referred: 'surenaa' } }, { upsert: true })
          db.collection('joinedUsers').insertOne({ userId: ctx.from.id, join: true })
          db.collection('balance').updateOne({ userId: pData[0].inviter }, { $set: { balance: see } }, { upsert: true })
          ctx.replyWithHTML(
            ''+startmsg+'', { disable_web_page_preview:true , reply_markup: { keyboard: [['📜Submit Details']], resize_keyboard: true } }
          )
        } else {
          db.collection('joinedUsers').insertOne({ userId: ctx.from.id, join: true })


          ctx.replyWithHTML(
            ''+startmsg+'',  { disable_web_page_preview:true , reply_markup: { keyboard: [['📜Submit Details']], resize_keyboard: true } }
          )
        }
      } else {
        mustJoin(ctx)
      }
    }
  } catch (e) {
    sendError(e, ctx)
  }
}

bot.start(botStart)
bot.hears(['⬅️ Back', '🔙 back'], botStart)






bot.hears('⚪️ Try Again', async (ctx) => {
  try {
    let bData = await db.collection('vUsers').find({ userId: ctx.from.id }).toArray()

    if (bData.length === 0) {

      let q1 = ['2483', '9727', '9755','4738','3641','1492','7329','1952','8410','1845','9973','8639','3729', '7732'];
    let q2 = q1[Math.floor(Math.random()*q1.length)];
    let ans = q2
      db.collection('checkUsers').updateOne({ userId: ctx.from.id }, { $set: { answer: ans } }, { upsert: true })
console.log(ans)
      await ctx.replyWithPhoto({ url: `https://api.codebazan.ir/captcha/?font=1&bg=1&text=${ans}&textcolor=1` }, { caption: "❇️ Enter the captcha:" });
      ctx.scene.enter('onCheck')
    } else {
      starter(ctx)
      return
    }

  } catch (err) {
    sendError(err, ctx)
  }
})



onCheck.hears(['⚪️ Try Again', '/start'], async (ctx) => {
  try {

    let bData = await db.collection('vUsers').find({ userId: ctx.from.id }).toArray()

    if (bData.length === 0) {
      ctx.scene.leave('onCheck')


      let q1 = ['2483', '9727', '9755','4738','3641','1492','7329','1952','8410','1845','9973','8639','3729', '7732'];
      let q2 = q1[Math.floor(Math.random()*q1.length)];
      let ans = q2
console.log(ans)
      db.collection('checkUsers').updateOne({ userId: ctx.from.id }, { $set: { answer: ans } }, { upsert: true })

      await ctx.replyWithPhoto({ url: `https://api.codebazan.ir/captcha/?font=1&bg=1&text=${ans}&textcolor=1` }, { caption: "❇️ Enter the captcha:" });
      ctx.scene.enter('onCheck')
    } else {
      return
    }
  } catch (err) {
    sendError(err, ctx)
  }
})

onCheck.on('text', async (ctx) => {
  try {
    let dbData = await db.collection('checkUsers').find({ userId: ctx.from.id }).toArray()
    let bData = await db.collection('pendUsers').find({ userId: ctx.from.id }).toArray()
    let dData = await db.collection('allUsers').find({ userId: ctx.from.id }).toArray()
    let ans = dbData[0].answer
console.log(ans)

    if (ctx.from.last_name) {
      valid = ctx.from.first_name + ' ' + ctx.from.last_name
    } else {
      valid = ctx.from.first_name
    }

    if (ctx.message.text == ans) {
        db.collection('vUsers').insertOne({ userId: ctx.from.id, answer: ans, name: valid })
        ctx.deleteMessage()

        ctx.scene.leave('onCheck')
        let joinCheck = await findUser(ctx)
        if (joinCheck) {
          let pData = await db.collection('pendUsers').find({ userId: ctx.from.id }).toArray()
          if (('inviter' in pData[0]) && !('referred' in dData[0])) {
            let bal = await db.collection('balance').find({ userId: pData[0].inviter }).toArray()
            var ref_bonus =  3000

            var cal = bal[0].balance * 1
            var sen = ref_bonus * 1
            var see = cal + sen
            var bot_cur = '$SANDWICH'
bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received ' + ref_bonus + ' ' + bot_cur, { parse_mode: 'markdown' })
            db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { inviter: pData[0].inviter, referred: 'surenaa' } }, { upsert: true })
            db.collection('joinedUsers').insertOne({ userId: ctx.from.id, join: true })
            db.collection('balance').updateOne({ userId: pData[0].inviter }, { $set: { balance: see } }, { upsert: true })

            ctx.replyWithHTML(
              ''+startmsg+'',  { disable_web_page_preview:true , reply_markup: { keyboard: [['📜Submit Details']], resize_keyboard: true } }            )

          } else{
            db.collection('joinedUsers').insertOne({ userId: ctx.from.id, join: true })


            ctx.replyWithHTML(
              ''+startmsg+'', { disable_web_page_preview:true , reply_markup: { keyboard: [['📜Submit Details']], resize_keyboard: true } }
            )
          }
        } else {
          mustJoin(ctx)
        }
      } else {
        ctx.replyWithMarkdown(' _wrong_')
      }
    }
  } catch (err) {
    sendError(err, ctx)
  }
})



bot.hears('🔗 Refer Link', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  var valid;
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
 
  
let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
    let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    let sum
    sum = thisUsersData[0].balance

   /* if (thisUsersData[0].virgin) {
      sum = notPaid.length * 0.00001000
    } else {
      sum = notPaid.length * 0.00001000
    }*/
    let sup
    let query = min_wd*200
    if(sum > query ){
    sup = sum/100
    db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: sup}}, {upsert: true})
    } else {
sup = sum*1
}
 
if(bData.length===0){
return}

    ctx.reply(`🕵️‍♂️ Welcome 

🎉  Share This Refer Link With Your Friends For Getting Refers

 
🔗 Your Refer Link : https://t.me/ZLFAirdropBot?start=${ctx.from.id}

♻️Your airdrop balance = ${sum}`,{parse_mode:'markdown'})
} catch (err) {
    sendError(err, ctx)
  }
})

bot.hears('👨‍👧Referral', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray()
ctx.reply(
'*⚡️ Per Refer =* '+ref_bonus+' '+bot_cur+' (10$)\n*👩‍✈️ Your Total Refferals:* '+allRefs.length+' *users*\n\n*➡️ Your Referral Link =*\nhttps://t.me/'+data.bot_name+'?start=' + ctx.from.id +'\n\n*⚠️ Fake & Cheat Referral Not Pay*\n*❗️IMPORTANT: You get a reward only if your referrals have completed mandatory tasks.*',  {parse_mode: 'markdown'})
} catch (err) {
    sendError(err, ctx)
  }
})
bot.hears('hi', async (ctx) => {
ctx.replyWithHTML(''+startmsg+'',{disable_web_page_preview:true})
})

bot.command('broadcast', (ctx) => {
if(ctx.from.id==admin){
ctx.scene.enter('getMsg')}
})

getMsg.enter((ctx) => {
  ctx.replyWithMarkdown(
    ' *Okay Admin 👮‍♂, Send your broadcast message*', 
    { reply_markup: { keyboard: [['⬅️ Back']], resize_keyboard: true } }
  )
})

getMsg.leave((ctx) => starter(ctx))

getMsg.hears('⬅️ Back', (ctx) => {ctx.scene.leave('getMsg')})

getMsg.on('text', (ctx) => {
ctx.scene.leave('getMsg')

let postMessage = ctx.message.text
if(postMessage.length>3000){
return ctx.reply('Type in the message you want to sent to your subscribers. It may not exceed 3000 characters.')
}else{
globalBroadCast(ctx,admin)
}
})

async function globalBroadCast(ctx,userId){
let perRound = 10000;
let totalBroadCast = 0;
let totalFail = 0;

let postMessage =ctx.message.text

let totalUsers = await db.collection('allUsers').find({}).toArray()

let noOfTotalUsers = totalUsers.length;
let lastUser = noOfTotalUsers - 1;

 for (let i = 0; i <= lastUser; i++) {
 setTimeout(function() {
      sendMessageToUser(userId, totalUsers[i].userId, postMessage, (i === lastUser), totalFail, totalUsers.length);
    }, (i * perRound));
  }
  return ctx.reply('Your message is queued and will be posted to all of your subscribers soon. Your total subscribers: '+noOfTotalUsers)
}

function sendMessageToUser(publisherId, subscriberId, message, last, totalFail, totalUser) {
  bot.telegram.sendMessage(subscriberId, message,{parse_mode:'html'}).catch((e) => {
if(e == 'Forbidden: bot was block by the user'){
totalFail++
}
})
let totalSent = totalUser - totalFail

  if (last) {
    bot.telegram.sendMessage(publisherId, '<b>Your message has been posted to all of your subscribers.</b>\n\n<b>Total User:</b> '+totalUser+'\n<b>Total Sent:</b> '+totalSent+'\n<b>Total Failed:</b> '+totalFail, {parse_mode:'html'});
  }
}
 
 


bot.hears('🎁Claim Reward', async (ctx) => {
try {

if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}

var duration_in_hours;

var tin = new Date().toISOString();
let dData = await db.collection('bonusforUsers').find({userId: ctx.from.id}).toArray()

if(dData.length===0){
db.collection('bonusforUsers').insertOne({userId: ctx.from.id, bonus: new Date()})
duration_in_hours = 99;
}else{
 duration_in_hours = ((new Date()) - new Date(dData[0].bonus))/1000/60/60;
}



if(duration_in_hours>=24){

let bal = await db.collection('balance').find({userId: ctx.from.id}).toArray()


let ran = bonus
let rann = ran*1
var adm = bal[0].balance*1
var addo = adm+rann

db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: addo}}, {upsert: true})

db.collection('bonusforUsers').updateOne({userId: ctx.from.id}, {$set: {bonus: tin}}, {upsert: true})

ctx.replyWithMarkdown('* + '+bonus+' '+bot_cur+' Added To Your Balance ⚡️\n\n🕔 Come Back After 24 Hours To Receive It Again*').catch((err) => sendError(err, ctx))
}else{
var duration_in_hour= Math.abs(duration_in_hours - 24);
var hours= Math.floor(duration_in_hour);
var minutes = Math.floor((duration_in_hour - hours)*60);
var seconds = Math.floor(((duration_in_hour - hours)*60-minutes)*60);
ctx.replyWithMarkdown('*❌Reward Already Claimed* \n_This Reward Only Claimed Once_').catch((err) => sendError(err, ctx))

}
}  catch (err) {
    sendError(err, ctx)
  }
})
bot.hears('📊Balance',async (ctx) => {

let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()
let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray()
let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
let sum = thisUsersData[0].balance

let wallet = aData[0].coinmail
let twiter = maindata[0].twiter


ctx.replyWithMarkdown('*🗣Invite your friends and earn '+ref_bonus+' (~10$) '+bot_cur+' wroth for each referral.*\n\n*💲 Your Balance:* '+sum.toFixed(1)+' '+bot_cur+'\n\n*🧕 User:* '+ctx.from.id+'\n*👨‍💼 Per Referral =* '+ref_bonus+' '+bot_cur+'\n*🔑 Wallet:* `'+wallet+'`')
})
bot.hears('📈Bot Status', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
  
  let time;
time = new Date();
time = time.toLocaleString();

bot.telegram.sendChatAction(ctx.from.id,'typing').catch((err) => sendError(err, ctx))
let dbData = await db.collection('vUsers').find({stat:"stat"}).toArray()
let dData = await db.collection('vUsers').find({}).toArray()

if(dbData.length===0){
db.collection('vUsers').insertOne({stat:"stat", value:0})
ctx.replyWithMarkdown(
'*🧭'+airdropName+'*. : Working\n\n*🖲Total Members :* `'+dData.length+'`\n\n\n*✅Speed :* Good\n*✅Timeout :* 0.02 Second\n*✅Server Time :* `'+time+'`')
return
}else{
let val = dbData[0].value*1
ctx.replyWithMarkdown(
'*🧭'+airdropName+'*. : Working\n\n*🖲Total Members :* `'+dData.length+'` *Users*\n\n\n*✅Speed :* Good\n*✅Timeout :* 0.02 Second\n*✅Server Time :* `'+time+'`')
}}
  catch (err) {
    sendError(err, ctx)
  }
})
bot.hears('🗓 Information',async (ctx) => {
  
  ctx.replyWithMarkdown('*Token Information:*\n\n*Name:* `MetaShib`\n*Symbol:* `MSHIB`\n*Decimale:* `18`\n\n*Contract Address:* `0x2cdbB9463b8c24D14b642E114a08F811D992d81c`\n*Network : Polygon*\n\n_If you submitted a wrong data then you can restart the bot and start resubmission by clicking /start before Token airdrop ends._')
  })


bot.hears('📜Submit Details', ctx => {
  var kkc = `🔹 Join Our Telegram [Channel](t.me/SandWichChannel) 

Press *"✅ Check"* if you have done this task.`
  ctx.replyWithMarkdown(kkc, { disable_web_page_preview: true, reply_markup: { keyboard: [['✅ Check']], resize_keyboard: true } })
})


bot.hears('💳 Bance', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  var valid;
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
 
  
let notPaid = await db.collection('allUsers').find({inviter: ctx.from.id, paid: false}).toArray() // only not paid invited users
    let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
    let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    let sum
    sum = thisUsersData[0].balance

   /* if (thisUsersData[0].virgin) {
      sum = notPaid.length * 0.00001000
    } else {
      sum = notPaid.length * 0.00001000
    }*/
    let sup
    let query = min_wd*200
    if(sum > query ){
    sup = sum/100
    db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: sup}}, {upsert: true})
    } else {
sup = sum*1
}
    ctx.reply('🤴 *User : '+ctx.from.first_name+'*   \n\n🌤 *Balance : '+sum.toFixed(8)+' '+bot_cur+'*\n\n*⚜️ Refer And Earn More*',{parse_mode:'markdown'})
} catch (err) {
    sendError(err, ctx)
  }
})

bot.hears('🏧 Wallet', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

    if ('coinmail' in dbData[0]) {
    ctx.replyWithMarkdown('* 💡 Your '+bot_cur+' Wallet Is: * `'+ dbData[0].coinmail +'`',
   Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set Wallet', 'iamsetemail')]
      ])
      )  
       .catch((err) => sendError(err, ctx))
    }else{
ctx.replyWithMarkdown('*💡 Your '+bot_cur+' Wallet Is:*  not set', 
    Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set Wallet ', 'iamsetemail')]
      ])
      ) 
           .catch((err) => sendError(err, ctx))
    }
} catch (err) {
    sendError(err, ctx)
  }
  
})

bot.hears('✅ Check', async ctx => {
let joinCheck = await findUser(ctx)
  if(joinCheck){
    ctx.scene.enter('fbhandle')
    await ctx.replyWithMarkdown('🅿️ Follow our [Twitter](https://twitter.com/BscLooters)\n\n🅿️ And Comment `Good` In Lattest Post\n\n⏩ Send Your twitter Link to me', { disable_web_page_preview: true, reply_markup: { remove_keyboard: true } })
 } else {
    ctx.replyWithMarkdown('*🆘 You need to complete all the task to continue*')
  }
})
bot.hears('✅ Done', async (ctx) => {
	ctx.scene.leave();
	await ctx.replyWithMarkdown('🅿️ Subscribe our sponsor [Youtube](https://youtu.be/q5lxL_M8HJk)\n\n🅿️ Like and Comment `Good Project` On This [Video](https://youtube.com/c/AirdropVictor)\n\n🅿️ Like All Video Also\n\n⏩ Send Your Youtube Link to me',{disable_web_page_preview:true,reply_markup: { remove_keyboard: true } })

ctx.scene.enter('fk');
})
	
fk.on('text', async (ctx) => {
  var first = await db.collection('balance').find({ userId: ctx.from.id })
  if (first.length == 0) {
    await db.collection('balance').insertOne({ userId: ctx.from.id, twiter: ctx.message.text })
  } else {
    await db.collection('balance').updateOne({ userId: ctx.from.id }, { $set: { twiter: ctx.message.text } }, { upsert: true })

  }
//await ctx.replyWithMarkdown(`*Submit your Matic polygon Address from Token Pocket or Trust Wallet*`, { disable_web_page_preview: true, reply_markup: { remove_keyboard: true } })

await ctx.replyWithPhoto({url : 'https://te.legra.ph/file/50cc07b0d377e60c7a171.jpg'} ,{caption :'🔹 Submit your Polygon ($MATIC) wallet address\n\nPlease, Use only TrustWallet or MetaMask'},{ parse_mode:'HTML' , reply_markup: { remove_keyboard: true }} )

  ctx.scene.enter('twiterhandle');
})
fbhandle.on('text', async (ctx) => {
	ctx.scene.leave();
  var ppc = `🔹 Join our Sponser Telegram [Channel](t.me/BscLooters).

Press *"✅ Done"* if you have done this task.`
  ctx.replyWithMarkdown(ppc, { disable_web_page_preview: true, reply_markup: { keyboard: [['✅ Done']], resize_keyboard: true } })
})

adreshandle.on('text', async (ctx) => {
let msg = ctx.message.text
db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {coinmail: ctx.message.text}}, {upsert: true})
   db.collection('allEmails').insertOne({email:ctx.message.text,user:ctx.from.id})
ctx.scene.leave();
await ctx.replyWithMarkdown(`🔹 Follow Cubic Drops [fasebook](https://fasebook.com/radical) , Like And Retweet The Pinned Post 
*
📄 Send Your Fase book Profile Link*
( Example : https://fasebook.com/yourusername )`, { disable_web_page_preview: true, reply_markup: { remove_keyboard: true } })
ctx.scene.enter('twiterhandle')
})
bot.action('next1', async (ctx) => {
ctx.replyWithHTML(`<b>Follow Radical Drops  </b><a href="https://youtube.com">'youtube'</a>`,Markup.inlineKeyboard([
      [Markup.button.callback('', 'add')]
      ])
      )
})
bot.action('iamsetemail', async (ctx) => {
  try {
  ctx.deleteMessage();
    ctx.replyWithMarkdown(
      '✍️ Now Send Your *TOMO* Wallet Address\n\n*'+bot_cur+' Contract Address*\n'+contract+'\n*Network : Tomo Chain*',{ reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true }})
        .catch((err) => sendError(err, ctx))
        ctx.scene.enter('getWallet')
  } catch (err) {
    sendError(err, ctx)
  }
})

getWallet.hears('🔙 back', (ctx) => {
  starter(ctx)
  ctx.scene.leave('getWallet')
})

getWallet.on('text', async(ctx) => {
try {
let msg = ctx.message.text
if(msg == '/start'){
ctx.scene.leave('getWallet')
starter(ctx)
}

 let email_test = /[a-zA-Z0-9]/
 if(email_test.test(msg)){
 let check = await db.collection('allEmails').find({wallet:ctx.message.text}).toArray() // only not paid invited users
if(check.length===0){
ctx.replyWithMarkdown(
'*🖊 Done:* Your Wallet Is Now\n`'+ctx.message.text+'`',
{ reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true } }
  )  
   .catch((err) => sendError(err, ctx))
   db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {wallet: ctx.message.text}}, {upsert: true})
   db.collection('allEmails').insertOne({wallet:ctx.message.text,user:ctx.from.id}) 
}else{
ctx.reply('Seems This address have been used in bot before by another user! Try Again')
}
}else{
 ctx.reply('🖊 Error: This is not a valid address! Send /start to return to the menu, or send a correct one')
 }
} catch (err) {
    sendError(err, ctx)
  }
})

twiterhandle.on('text', async (ctx) => {
try {


let msg = ctx.message.text
db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {coinmail: ctx.message.text}}, {upsert: true})
   db.collection('allEmails').insertOne({wallet:ctx.message.text,user:ctx.from.id})


let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}

let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()

let dData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

  let joinCheck = await findUser(ctx)
  if(joinCheck){
       if(('inviter' in pData[0]) && !('referred' in dData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received '+ref_bonus+' '+bot_cur, {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()

let wallet = aData[0].coinmail

let twiter = maindata[0].twiter
ctx.replyWithMarkdown(
    ''+welcome+'',
{ reply_markup: { keyboard: [['📊Balance'],['🎁Claim Reward','👨‍👧Referral'],['💳Withdraw']], resize_keyboard: true }})
      
      
      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()

let wallet = aData[0].coinmail

let twiter = maindata[0].twiter

ctx.replyWithMarkdown(
  ''+welcome+'',
{ reply_markup: { keyboard: [['📊Balance'],['🎁Claim Reward','👨‍👧Referral'],['💳Withdraw']], resize_keyboard: true }})
      
    }
  }else{
  mustJoin(ctx)
  }
} catch (err) {
    sendError(err, ctx)
    console.log(err)
  }
  
  ctx.scene.leave();
})

bot.hears('💳Withdraw', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  
let tgData = await bot.telegram.getChatMember("@Bsclooters", ctx.from.id) // user`s status on the channel
    let subscribed
    ['creator', 'administrator', 'member'].includes(tgData.status) ? subscribed = true : subscribed = false
if(subscribed){

let bData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))

let bal = bData[0].balance

let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

    if ('coinmail' in dbData[0]) {
if(bal>=min_wd){
var post="📝 Please, enter the amount of *Elon Master Inu ($EMI)* token you want to withdraw. \n\n*💎 Your Balance:* `"+bal.toFixed(0)+"` $EMI\n\n*▪️ Minimum:* `500000` $EMI"

ctx.replyWithMarkdown(post, { reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true }})
ctx.scene.enter('onWithdraw')
}else{
ctx.replyWithMarkdown("_❌ Your balance low you should have at least 500k Elon Master Inu to Withdraw_")
}
    }else{
    ctx.replyWithMarkdown('💡 *Your wallet address is:* `not set`', 
    Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change', 'iamsetemail')]
      ])
      ) 
           .catch((err) => sendError(err, ctx))
    
}

}else{
mustJoin(ctx)
}

} catch (err) {
    sendError(err, ctx)
  }
})

onWithdraw.hears('🔙 back', (ctx) => {
  starter(ctx)
  ctx.scene.leave('onWithdraw')
})

onWithdraw.on('text', async (ctx) => {
try {
var valid,time
time = new Date();
time = time.toLocaleString();
 
 if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
 
 let msg = ctx.message.text*1
 if(!isNumeric(ctx.message.text)){
 ctx.replyWithMarkdown("❌ _Send a value that is numeric or a number_")
 ctx.scene.leave('onWithdraw')
 return
 }
 let dbData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))
 
 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

 
 let bData = await db.collection('withdrawal').find({userId: ctx.from.id}).toArray()
 let dData = await db.collection('vUsers').find({stat: 'stat'}).toArray()
let vv = dData[0].value*1

 let ann = msg*1
 let bal = dbData[0].balance*1
let wd = dbData[0].withdraw
let rem = bal-ann
let ass = wd+ann
let sta = vv+ann
let wallet = aData[0].coinmail
if((msg>bal) | ( msg<min_wd)){
ctx.replyWithMarkdown("*😐 Send a value over *"+min_wd.toFixed(8)+" "+bot_cur+"* but not greater than *"+bal.toFixed(8)+" "+bot_cur+" ")
return
 }
 
 if (bal >= min_wd && msg >= min_wd && msg <= bal) {
      
db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: rem, withdraw: ass}}, {upsert: true})
db.collection('vUsers').updateOne({stat: 'stat'}, {$set: {value: sta}}, {upsert: true})

 //axios
 //.post('https://madarchodsale.herokuapp.com/post', 
   // { address: wallet , amount : msg , tokenid : "1004252" }
 // )
 // .then(function (rsponse) {
   // console.log(response.data);
let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray()

 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

let maindata = await db.collection('balance').find({ userId: ctx.from.id }).toArray()


let twiter = maindata[0].twiter

const mesl = `<code>${wallet}</code>,${msg}`
    ctx.replyWithMarkdown('💴 *Your withdraw Request Has Submitted\n\nYou Will Get Payment In 36 Hours*')
bot.telegram.sendMessage(data.payment_channel,mesl,{parse_mode: 'html',disable_webpage_preview:true}).catch((err) => sendError(err, ctx))
     // bot.telegram.sendMessage(data.payment_channel,`<b>New '+bot_cur+' Withdraw Paid ✅</b>\n\n<b>👨‍🦰 User:</b> '+ctx.from.first_name+'\n<b>💰 Amount :</b> '+msg+'\n<b>🔹 Wallet :</b> \n`'+wallet+'`\n<b>🏧 Transaction Link :</b> <a href="https://tomochain.org/#/transaction/'+result.transactionHash+'">'+result.transactionHash+'</a>\n\n<b>🔰 Airdrop Link</b> :\n<b>@'+data.bot_name+'</b>`,{parse_mode: 'html',disable_webpage_preview:true}).catch((err) => sendError(err, ctx))

  .catch(error => {
    console.error(error)
    ctx.replyWithMarkdown('The Bot HasEncountred An problem While Complating Your Withdraw Request\nYour Problem Is Sended AUtomatically To Bot Admin Youll Recieve Your Withdraw In 24 hours')
  })
  
  
}else{
 ctx.replyWithMarkdown("😐 Send a value over *"+min_wd+" "+bot_cur+"* but not greater than *"+bal.toFixed(8)+" "+bot_cur+"* ")
ctx.scene.leave('onWithdraw')
return
 }

} catch (err) {
    console.log(err, ctx)
  }
})


bot.action(`paid`,  async (ctx) => {

 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

let maindata = await db.collection('balance').find({ userId : 'hey'}).toArray()



let id = maindata[0].idm

bot.telegram.sendMessage(id,'paid')
})
function rndFloat(min, max){
  return (Math.random() * (max - min + 1)) + min
}
function rndInt(min, max){
  return Math.floor(rndFloat(min, max))
}
  
  function mustJoin(ctx){
  let msg = `<b>📃 Radical BTT Giveaway Bot Welcomes You

💵 Total For Airdrop : 6000 BTT 
📡 Website : https://www.dhddhdhd
⌛️ Distribution : 15th December

📢  You Must Complete All The Below Tasks A Participant Of Bot.
🔹 Join Cubic Drops Telegram</b> <a href="https://t.me/clickgonews">Channel</a><b>
🔹 Join Cubic Drops Telegram</b> <a href="https://t.me/clickgonews">Group</a><b>
🔹 Follow Cubic Drops Twitter Like And Retweet The Pinned Post


Complete All Above Tasks Then Click "Submit My Details"</b>`
ctx.replyWithHTML(
  ''+startmsg+'', {disable_web_page_preview:true , reply_markup: { keyboard: [['📜Submit Details']], resize_keyboard: true } }
)
        }
 


function starter (ctx) {
  ctx.replyWithMarkdown(
    ''+welcome+'',
{ reply_markup: { keyboard: [['📊Balance'],['🎁Claim Reward','👨‍👧Referral'],['💳Withdraw']], resize_keyboard: true }})
      

   }

function sendError (err, ctx) {
  ctx.reply('An Error Happened ☹️: '+err.message)
 bot.telegram.sendMessage(admin, `Error From [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) \n\nError: ${err}`, { parse_mode: 'markdown' })
}


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

async function findUser(ctx){
let isInChannel= true;
let cha = data.channelscheck
for (let i = 0; i < cha.length; i++) {
const chat = cha[i];
let tgData = await bot.telegram.getChatMember(chat, ctx.from.id)
  
  const sub = ['creator','adminstrator','member'].includes(tgData.status)
  if (!sub) {
    isInChannel = false;
    break;
  }
}
return isInChannel
}
/*

var findUser = (ctx) => {
var user = {user: ctx.from.id }
channels.every(isUser, user)
}


var isUser = (chat) => {
console.log(this)
console.log(chat)
/*l

let sub = 

return sub == true;
}
*/
