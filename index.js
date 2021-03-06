const fs = require('fs')
const https = require('https')
const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')

const { Extra, Markup } = Telegraf
const { match } = TelegrafI18n

const token = fs.readFileSync(process.env.npm_package_config_tokenpath, 'utf8').trim()
const bot = new Telegraf(token)
bot.use(Telegraf.memorySession())

const i18n = new TelegrafI18n({
  allowMissing: true,
  defaultLanguage: 'en',
  directory: 'locales',
  useSession: true
})
bot.use(i18n.middleware())


function getFile(path, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const errorhandler = (err) => {
      fs.unlink(dest)
      reject(err.message)
    }
    file.on('error', errorhandler)

    https.get(path, function(res) {
      res.pipe(file)
      file.on('finish', () => {
        file.close(() => {
          resolve()
        })
      })
    }).on('error', errorhandler)
  })
}

// get photo link to download it later
bot.use(async (ctx, next) => {
  if (ctx.message && ctx.message.photo && ctx.message.photo.length > 0) {
    const widths = ctx.message.photo.map(o => o.width)
    const maxWidth = Math.max(...widths)
    const biggestPhoto = ctx.message.photo.filter(o => o.width === maxWidth)[0]
    ctx.state.fileLink = await bot.telegram.getFileLink(biggestPhoto)
  }
  return next()
})

bot.hears(/.*#Ingress.*/, ctx => {}) // Ignore the 'My #Ingress agent profile.', hopefully in every language

bot.on('document', ctx => {
  return ctx.reply(ctx.i18n.t('onlyPhotos'), Markup.removeKeyboard().extra())
})

bot.command('about', ctx => ctx.replyWithMarkdown('This bot was created by @EdJoPaTo.\n\nIf you want to host your own for your Missionday or have some improvements in mind, take a look at the [Github Repository](https://github.com/EdJoPaTo/missionday-telegrambot) or write a message via Telegram (@EdJoPaTo).', Markup.removeKeyboard().extra()))

const languageList = {
  'de-DE': 'de',
  'en-DE': 'de',
  'en-US': 'en'
}

bot.command('start', ctx => {
  ctx.session = {} // ensure session is clean on a restart

  // load language from language code
  if (ctx.from.language_code) {
    const code = ctx.from.language_code
    const lang = languageList[code]
    if (lang) {
      ctx.i18n.locale(lang)
    } else {
      console.warn('unhandled language code', code)
    }
  }

  return ctx.reply(ctx.i18n.t('greeting', {
    name: ctx.from.first_name
  }), Markup.removeKeyboard().extra())
})

bot.on('photo', ctx => {
  ctx.session.photoUrl = ctx.state.fileLink
  return ctx.reply(ctx.i18n.t('pictureVisible'), Extra.markup(Markup.resize().keyboard([
    ctx.i18n.t('pictureYes'),
    ctx.i18n.t('pictureNo')
  ])))
})

bot.hears(match('pictureNo'), ctx => {
  delete ctx.session.photoUrl
  return ctx.reply(ctx.i18n.t('pictureAgain'), Markup.removeKeyboard().extra())
})

function generateUsernameCheckKeyboard(ctx) {
  return Markup.resize().keyboard([
    [
      ctx.i18n.t('ingressUsernameYesBlue'),
      ctx.i18n.t('ingressUsernameYesGreen')
    ],
    [
      ctx.i18n.t('ingressUsernameNo')
    ]
  ])
}

bot.hears(match('pictureYes'), ctx => {
  if (ctx.from.username) {
    ctx.session.agentname = ctx.from.username
    return ctx.replyWithMarkdown(ctx.i18n.t('ingressUsernameQuestionTGUsername', { agent: ctx.session.agentname }), Extra.markup(generateUsernameCheckKeyboard(ctx)))
  }
  return ctx.reply(ctx.i18n.t('ingressUsernameQuestion'), Markup.forceReply().extra())
})

bot.hears(match('ingressUsernameNo'), Telegraf.optional(ctx => ctx.session.photoUrl, ctx => {
  return ctx.reply(ctx.i18n.t('ingressUsernameAgain'), Markup.forceReply().extra())
}))

bot.hears([match('ingressUsernameYesBlue'), match('ingressUsernameYesGreen')], Telegraf.optional(ctx => ctx.session.photoUrl && ctx.session.agentname, async ctx => {
  const url = ctx.session.photoUrl
  const id = ctx.from.id
  const color = ctx.message.text === ctx.i18n.t('ingressUsernameYesBlue') ? 'blue' : 'green'
  const name = ctx.session.agentname

  await getFile(url, `checkouts/${id}-${color}-${name}.jpg`)
  return ctx.reply(ctx.i18n.t('checkoutComplete'), Markup.removeKeyboard().extra())
}))

bot.on('text', Telegraf.optional(ctx => {
  if (!ctx.session.photoUrl) return false
  const text = ctx.message.reply_to_message.text
  if (text === ctx.i18n.t('ingressUsernameAgain')) return true
  if (text === ctx.i18n.t('ingressUsernameQuestion')) return true
  return false
}, ctx => {
  ctx.session.agentname = ctx.message.text
  return ctx.replyWithMarkdown(ctx.i18n.t('ingressUsernameIsCorrect', {
    agent: ctx.session.agentname
  }), Extra.markup(generateUsernameCheckKeyboard(ctx)))
}))

bot.on('text', ctx => ctx.reply(ctx.i18n.t('textBeforePhoto'), Markup.removeKeyboard().extra()))

bot.startPolling()
