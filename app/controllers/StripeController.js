'use strict'

// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
var firebaseDb = require('../../lib/firebaseDb')
const GameConsts = require('../../lib/GameConsts')

let ApiStripeController = {
  chargeKey: function (req, res) {
    const key = req.body.key
    const uid = req.body.uid
    if (!key || !uid) return res.redirect('/buy?error=true&message=' + encodeURIComponent('Please use a different key.'))

    firebaseDb.database()
      .ref('keys/' + key.trim())
      .once('value')
      .then(function (snapshot, err) {
        // If a key is true is has been used already
        if (err || snapshot.val() !== false) {
          // The key is invalid.
          console.error(err)
          return res.redirect('/buy?error=true&message=' + encodeURIComponent('Please use a different key.'))
        }

        firebaseDb.database()
          .ref('keys/' + key.trim())
          .set(uid)

        firebaseDb.database()
          .ref('premium_user_lookup/' + uid)
          .set(true)

        firebaseDb.database()
          .ref('user_transactions/' + uid)
          .push({
            amount: 0,
            type: 'premium',
            method: 'key',
            key: key,
            created_at: Date.now()
          }, function (err) {
            if (err) {
              // The card has been declined.
              console.error(err)
              return res.redirect('/buy?error=true&message=' + encodeURIComponent('We were unable to charge that card, please use a different one.'))
            }
            res.redirect('/buy')
          })
      })
  },
  charge: function (req, res) {
    // Token is created using Stripe.js or Checkout!
    // Get the payment token submitted by the form:
    const token = req.body.stripeToken
    const uid = req.body.uid
    const amount = req.body.amount

    if (!uid || !token) return res.redirect('/buy?error=true&message=' + encodeURIComponent('There was an issue processing your payment.'))

    if (parseInt(amount) !== parseInt(GameConsts.GAME_TOTAL_PRICE * 100)) {
      console.error('Charge amount does not equal game total price.', amount, (GameConsts.GAME_TOTAL_PRICE * 100))
      return res.redirect('/buy?error=true&message=' + encodeURIComponent('We were unable to process your transaction, please try again.'))
    }

    // Charge the user's card:
    stripe.charges.create({
      amount: amount,
      currency: 'usd',
      description: 'Premium RangerSteve.io',
      source: token
    }, function (err, charge) {
      // asynchronously called
      if (err) {
        console.error(err)
        return
      }

      firebaseDb.database()
        .ref('premium_user_lookup/' + uid)
        .set(true)

      firebaseDb.database()
        .ref('user_transactions/' + uid)
        .push({
          charge_id: charge.id,
          amount: charge.amount,
          type: 'premium',
          method: 'stripe',
          created_at: Date.now()
        }, function (err) {
          if (err) {
            // The card has been declined.
            console.error(err)
            return res.redirect('/buy?error=true&message=' + encodeURIComponent('We were unable to charge that card, please use a different one.'))
          }
          res.redirect('/buy')
        })
    })
  }
}

module.exports = ApiStripeController
