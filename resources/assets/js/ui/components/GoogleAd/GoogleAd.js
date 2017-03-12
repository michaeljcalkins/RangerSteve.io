import React, { Component, PropTypes } from 'react'

export default class GoogleAd extends Component {
  shouldComponentUpdate () {
    return false
  }

  componentDidMount () {
    if (window) (window.adsbygoogle = window.adsbygoogle || []).push({})
  }

  render () {
    return (
      <ins className='adsbygoogle'
        style={this.props.style}
        data-adtest='on'
        data-ad-test='on'
        data-ad-client={this.props.client}
        data-ad-slot={this.props.slot}
        data-ad-format={this.props.format} />
    )
  }
}

GoogleAd.defaultProps = {
  style: {display: 'block'},
  format: 'auto'
}

GoogleAd.propTypes = {
  style: PropTypes.object,
  client: PropTypes.string.isRequired,
  slot: PropTypes.string.isRequired,
  format: PropTypes.string
}
