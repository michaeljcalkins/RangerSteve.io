import React from 'react'

export default class GoogleAd extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        return (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    render() {
        var style;
        style = {
            display: "inline-block",
            width: this.props.width,
            height: this.props.height
        }

        return (
            <ins
                className="adsbygoogle"
                style={ style }
                data-ad-client="ca-pub-2986206357433139"
                data-ad-slot={ this.props.slot }
            />
        );
    }
}