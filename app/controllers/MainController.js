'use strict'

const fs = require('fs')
const moment = require('moment')
const map = require('lodash/map')
const kebabCase = require('lodash/kebabCase')
const hri = require('human-readable-ids').hri

const GameConsts = require('../../lib/GameConsts')
const Server = require('../Server')

let MainController = {
  home: function (req, res) {
    // Room table
    const rooms = require('../sockets').getRooms()
    const numberOfRooms = Object.keys(rooms).length
    const maxIdleSeconds = GameConsts.MAX_IDLE_TIME_IN_MS / 1000

    res.render('home', {
      maxIdleSeconds: maxIdleSeconds,
      numberOfRooms: numberOfRooms,
      rooms: rooms
    })
  },

  rooms: function (req, res) {
    // Room table
    const rooms = require('../sockets').getRooms()
    const numberOfRooms = Object.keys(rooms).length
    const maxRoomSize = GameConsts.MAX_ROOM_SIZE
    const maxIdleSeconds = GameConsts.MAX_IDLE_TIME_IN_MS / 1000

    res.render('rooms', {
      maxRoomSize: maxRoomSize,
      maxIdleSeconds: maxIdleSeconds,
      numberOfRooms: numberOfRooms,
      modes: GameConsts.MODES,
      rooms: rooms
    })
  },

  whatsNew: function (req, res) {
    res.render('whats-new')
  },

  buy: function (req, res) {
    res.render('buy', {
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
      gamePrice: GameConsts.GAME_PRICE,
      gameDiscount: GameConsts.GAME_DISCOUNT,
      gameTotalPrice: GameConsts.GAME_TOTAL_PRICE
    })
  },

  howToPlay: function (req, res) {
    res.render('how-to-play')
  },

  privacy: function (req, res) {
    res.render('privacy')
  },

  createARoom: function (req, res) {
    res.render('create-a-room', {
      gamemodes: GameConsts.GAMEMODES,
      modes: GameConsts.MODES,
      maps: GameConsts.MAPS,
      randomRoomName: hri.random().replace(/[^a-zA-Z0-9 -]/g, '')
    })
  },

  mapEditor: function (req, res) {
    let fileStat = fs.statSync('public/css/app.css')
    let lastModifiedTime = moment(fileStat.mtime).unix()

    res.render('map-editor', {
      lastModifiedTime: lastModifiedTime
    })
  },

  leaderboards: function (req, res) {
    res.render('leaderboards')
  },

  battleStats: function (req, res) {
    res.render('battle-stats', req.params)
  },

  game: function (req, res) {
    let fileStat = fs.statSync('public/js/app.js')
    let lastModifiedTime = moment(fileStat.mtime).unix()

    res.render('game', {
      cloudfrontUrl: process.env.CLOUDFRONT_URL,
      lastModifiedTime: lastModifiedTime,
      isProduction: process.env.NODE_ENV === 'production'
    })
  },

  credits: function (req, res) {
    let fileStat = fs.statSync('public/css/app.css')
    let lastModifiedTime = moment(fileStat.mtime).unix()

    res.render('credits', {
      lastModifiedTime: lastModifiedTime
    })
  },

  admin: function (req, res) {
    res.render('admin', {
      announcement: 'A new version of the game will be deployed in a moment...'
    })
  },

  adminAnnouncement: function (req, res) {
    let error = false
    let success = false

    if (!req.body || !req.body.announcement) {
      error = 'Announcement cannot be empty.'
    } else {
      Server.send(
        GameConsts.EVENT.ANNOUNCEMENT,
        req.body.announcement
      )
      success = true
    }

    res.render('admin', {
      error: error,
      success: success,
      announcement: req.body.announcement
    })
  }
}

module.exports = MainController
