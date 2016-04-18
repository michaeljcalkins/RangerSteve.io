import { PropTypes } from 'react'

const propTypes = {
    field: PropTypes.string.isRequired
}

export default function GetQueryString(field, url) {
    check({ field }, propTypes)

    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
}
