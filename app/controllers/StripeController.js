'use strict'

// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
var firebaseDb = require('../../lib/firebaseDb')
const GameConsts = require('../../lib/GameConsts')

let ApiStripeController = {
  charge: function (req, res) {
    // Token is created using Stripe.js or Checkout!
    // Get the payment token submitted by the form:
    var token = req.body.stripeToken // Using Express

    // Charge the user's card:
    stripe.charges.create({
      amount: req.body.amount,
      currency: 'usd',
      description: 'Example charge',
      source: token
    }, function (err, charge) {
      // asynchronously called
      if (err) {
        console.error(err)
        return
      }

      firebaseDb.database()
        .ref('user_transactions/' + req.body.uid)
        .push({
          amount: charge.amount,
          gold: GameConsts.STORE_PRICES[charge.amount],
          method: 'stripe',
          created_at: Date.now()
        }, function (err) {
          if (err) {
            // The card has been declined.
            console.error(err)
            return res.redirect('/buy?success=false')
          }
          res.redirect('/buy?success=true')
        })
    })
  }
}

module.exports = ApiStripeController
