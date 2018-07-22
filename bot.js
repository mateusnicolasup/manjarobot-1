const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')
const cheerio = require('cheerio')
const message = require('./messages')
const settings = require('./settings')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
var emoji = require('node-emoji').emoji

const bot = new TelegramBot(settings.token, { polling: true })


bot.on('new_chat_members', (msg) => {
  bot.sendMessage(msg.chat.id, 'Olá ' + msg.from.first_name + ',' + message.welcome)
})

bot.on('left_chat_participant', (msg) => {
  bot.sendMessage(msg.chat.id, 'Adeus ' + msg.from.first_name + ',' + message.by)
})



bot.onText(/\/forum/, (msg) => {
  bot.sendMessage(msg.chat.id, message.forumLink, { parse_mode: 'Markdown' }).catch((error) => { bot.sendMessage(msg.chat.id, 'Ei ' + msg.from.first_name + ', ' + message.before) })
})

bot.onText(/\/instalacao/, (msg) => {
  const userID = msg.from.id
  bot.sendMessage(msg.chat.id, message.instalacaoLink, { parse_mode: 'Markdown' }).catch((error) => { bot.sendMessage(msg.chat.id, 'Ei ' + msg.from.first_name + ', ' + message.before) })
})

bot.onText(/\/gnome/, (msg) => {
  bot.sendMessage(msg.chat.id, message.gnomeAnswer, { parse_mode: 'Markdown' })
})
bot.onText(/\/desktopfriday/, (msg) => {
  bot.sendMessage(msg.chat.id, message.desktopfriday, { parse_mode: 'Markdown' })
})
bot.onText(/\/kde/, (msg) => {
  bot.sendMessage(msg.chat.id, message.kdeAnswer, { parse_mode: 'Markdown' })
})
bot.onText(/\/xfce/, (msg) => {
  bot.sendMessage(msg.chat.id, message.xfceAnswer, { parse_mode: 'Markdown' })
})
bot.onText(/\/socorro/, (msg) => {
  bot.sendMessage(msg.chat.id, message.erico, { parse_mode: 'Markdown' })
})
bot.onText(/\/politica/, (msg) => {
  bot.sendMessage(msg.chat.id, message.politica, { parse_mode: 'Markdown' })
})


bot.onText(/\/grubrescue/, (msg) => {
  const userID = msg.from.id
  bot.sendMessage(msg.chat.id, message.grub).catch((error) => { bot.sendMessage(msg.chat.id, 'Ei ' + msg.from.first_name + ', ' + message.before) })
})

bot.onText(/\/mirror/, (msg) => {
  const userID = msg.from.id
  bot.sendMessage(msg.chat.id, message.mirror, { parse_mode: 'Markdown' }).catch((error) => { bot.sendMessage(msg.chat.id, 'Ei ' + msg.from.first_name + ', ' + message.before) })
})

bot.onText(/\/regras/, (msg) => {
  const userID = msg.from.id
  bot.sendMessage(msg.chat.id, message.rules, { parse_mode: 'Markdown' }).catch((error) => { bot.sendMessage(msg.chat.id, 'Ei ' + msg.from.first_name + ', ' + message.before) })
})

bot.onText(/\/help/, (msg) => {
  const userID = msg.from.id
  bot.sendMessage(msg.chat.id, message.botComandos, { parse_mode: 'Markdown' }).catch((error) => { bot.sendMessage(msg.chat.id, 'Ei ' + msg.from.first_name + ', ' + message.before) })
})


bot.onText(/\/awesomelinux/, (msg) => {
  const userID = msg.from.id
  bot.sendMessage(msg.chat.id, message.aweLinks, { parse_mode: 'Markdown' }).catch((error) => { bot.sendMessage(msg.chat.id, 'Ei ' + msg.from.first_name + ', ' + message.before) })
})


bot.onText(/\/arch/, (msg) => {
  bot.sendPhoto(msg.chat.id, message.photoLink)
})


bot.onText(/\/espaco/, (msg) => {
  bot.sendMessage(msg.chat.id, message.espaco, { parse_mode: 'Markdown' })
})

bot.onText(/\/kernel/, (msg) => {
  bot.sendMessage(msg.chat.id, message.kernel, { parse_mode: 'Markdown' })
})
bot.onText(/\/lowspecgames/, (msg) => {
  bot.sendMessage(msg.chat.id, message.recomendJogos, { parse_mode: 'Markdown' })
})

bot.onText(/\/drivers/, (msg) => {
  bot.sendMessage(msg.chat.id, message.drivers, { parse_mode: 'Markdown' })
})

bot.onText(/\/pacman/, (msg) => {
  bot.sendMessage(msg.chat.id, message.pacman, { parse_mode: 'Markdown' })
})

bot.onText(/\/pamacoctopi/, (msg) => {
  bot.sendMessage(msg.chat.id, message.pamacoctopi, { parse_mode: 'Markdown' })
})




// Parte relacionada aos elogios
bot.onText(/\/elogiar (.+)/, (msg, match) => {
  const chatID = msg.chat.id
  const userID = msg.from.id
  const userNICK = msg.from.username
  const user = match[1]; // mensagem capturada
  if (chatID == userID) {
    bot.sendMessage(chatID, message.elogioGrupo)
  } else {
    var count1 = (user.match(/@/g) || []).length
    var count2 = (user.match(/ /g) || []).length
    if (count1 > 1 || count2 > 1) {
      bot.sendMessage(chatID, message.erroElogio)
    } else {
      if (userNICK === user.slice(1, user.length)) {
        bot.sendMessage(chatID, message.autoElogio)
      } else if (user === '@manjarobrasilv2_bot') {
        bot.sendMessage(chatID, 'Obrigado ' + userNICK + message.botElogio + emoji.heart)
      } else {
        commend(user)
        bot.sendMessage(chatID, message.enviaElogio)
      }
    }

  }
})

bot.onText(/\/contar (.+)/, (msg, match) => {
  const chatID = msg.chat.id
  const user = match[1]; // mensagem capturada
  countCommends(user, chatID)
})

bot.onText(/\/rank/, (msg) => {
  const chatID = msg.chat.id
  bestCommends(chatID)
})

////////// FUNÇÕES DO BANCO DE DADOS
// faz elogio ao usuário
function commend(nick) {
  MongoClient.connect(settings.database, function (err, client) {
    assert.equal(null, err);
    const db = client.db(settings.dbName)
    const collection = db.collection('avaliacao')
    // Procura ver se o usuário já foi elogiado alguma vez
    collection.find({ 'nick': nick }).toArray(function (err, docs) {
      assert.equal(err, null)
      if (docs.length === 0) {
        // Se não foi elogiado cadastra ele
        collection.insertMany([
          { 'nick': nick, 'commend': 1 }
        ], function (err, result) {
          assert.equal(err, null)
        })
      } else {
        // Se foi elogiado adiciona mais um elogio
        collection.updateOne({ 'nick': nick }
          , { $inc: { 'commend': 1 } }, function (err, result) {
            assert.equal(err, null)
          })
      }
      client.close()
    })
  })
}

// E a quantidade de elogios de um usuário
function countCommends(nick, chatID) {
  MongoClient.connect(settings.database, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server")
    const db = client.db(settings.dbName)
    const collection = db.collection('avaliacao')
    // Procura ver se o usuário já foi elogiado alguma vez
    collection.find({ 'nick': nick }).toArray(function (err, docs) {
      assert.equal(err, null)
      if (docs.length === 0) {
        bot.sendMessage(chatID, nick + message.semElogio)
      } else {
        bot.sendMessage(chatID, message.contaElogio + nick + ' é ' + docs[0].commend)
      }
      client.close()
    })
  })
}

//melhores avaliações
function bestCommends(chatID) {
  MongoClient.connect(settings.database, function (err, client) {
    assert.equal(null, err)
    console.log("Connected successfully to server")
    const db = client.db(settings.dbName)
    const collection = db.collection('avaliacao');
    // Procura ver se o usuário já foi elogiado alguma vez
    collection.find().sort({ 'commend': -1 }).limit(10).toArray(function (err, docs) {
      assert.equal(err, null)
      var text = 'Rank\n'
      for (let index = 0; index < docs.length; index++) {
        const element = docs[index]
        console.log(element)
        text += element.nick + ': ' + element.commend + ' elogios.\n'
        console.log(text)
      }
      bot.sendMessage(chatID, String(text))
      client.close()
    })
  })
}
