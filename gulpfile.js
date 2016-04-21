var elixir = require('laravel-elixir')

require('laravel-elixir-vueify')

elixir.config.assetsPath = 'assets'

elixir(function(mix) {
    mix
        .sass('./assets/sass/app.scss', './public/stylesheets/app.css')
        .browserify('./assets/js/app.js', './public/javascripts/app.js')
})
