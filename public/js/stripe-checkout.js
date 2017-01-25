window.Vue.component('stripe-checkout', {
  template: `
    <div :id="formId">
      <div @click.prevent="purchase()" :disabled="!loaded">
        <slot></slot>
      </div>
    </div>
  `,
  props: {
    formId: {
      required: false,
      default: 'vue-stripe'
    },
    stripeKey: {
      required: true
    },
    stripeImage: {
      default: null
    },
    stripeName: {
      default: null
    },
    stripeDescription: {
      default: null
    },
    stripeAmount: {
      required: true,
      default: null
    },
    options: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data: function () {
    return {
      stripeEmail: '',
      stripeToken: '',
      loaded: false
    }
  },
  mounted () {
    this.injectCheckoutScript()
      .then(() => this.configureStripe())
      .catch(e => console.error(e))

    window.addEventListener('popstate', function () {
      this.stripe.close()
    })
  },
  methods: {
    selectedProduct () {
      return {
        image: this.stripeImage,
        name: this.stripeName,
        amount: Number(this.stripeAmount),
        description: this.stripeDescription
      }
    },
    injectCheckoutScript () {
      let self = this
      let el = document.createElement('script')
      let ctr = 0
      let scriptSource = 'https://checkout.stripe.com/checkout.js'
      let scripts = document.getElementsByTagName('script')
      let scriptExists = false

      for (var i in scripts) {
        if (scripts[i].src === scriptSource) {
          scriptExists = true
        }
      }

      el.setAttribute('src', scriptSource)
      if (!scriptExists) {
        document.querySelector('#' + this.formId).appendChild(el)
      }

      return new Promise((resolve, reject) => {
        let handle = window.setInterval(function () {
          if (window.StripeCheckout) {
            self.loaded = true
            resolve()
            clearInterval(handle)
          }
          ctr++
          if (ctr > 1000) {
            reject('vue-stripe: Unable to load checkout.js')
            clearInterval(handle)
          }
          }, 5)
        })
      },
      configureStripe: function () {
        let self = this
        let options = window.merge.recursive(true, {
          key: self.stripeKey,
          image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
          token: function (token) {
            self.$nextTick(function () {
              var formElement = document.querySelector('#' + self.formId)

              var tokenInput = document.createElement('input')
              tokenInput.type = 'hidden'
              tokenInput.name = 'stripeToken'
              tokenInput.value = token.id
              formElement.parentElement.appendChild(tokenInput)

              var emailInput = document.createElement('input')
              emailInput.type = 'hidden'
              emailInput.name = 'stripeEmail'
              emailInput.value = token.email
              formElement.parentElement.appendChild(emailInput)

              var amountInput = document.createElement('input')
              amountInput.type = 'hidden'
              amountInput.name = 'amount'
              amountInput.value = self.stripeAmount
              formElement.parentElement.appendChild(amountInput)

              formElement.parentElement.submit()
            })
          }
        }, this.options)
        this.stripe = window.StripeCheckout.configure(options)
      },
    purchase () {
      let product = this.selectedProduct()
      if (typeof product === 'object' && product.hasOwnProperty('promise')) {
        product.then(function (data) {
          product = data.data
          this.stripe.open(product)
        })
      } else if (product) {
        this.stripe.open(product)
      } else {
        // bus.$emit('vue-stripe.not-found')
        console.log('vue-stripe is not found.')
      }
    }
  }
})
