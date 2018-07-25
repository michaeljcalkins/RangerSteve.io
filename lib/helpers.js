function guid () {
  function s4 () {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4()
}

function sizeOf (object) {
  if (object !== null && typeof (object) === 'object') {
    if (Buffer.isBuffer(object)) {
      return object.length
    } else {
      var bytes = 0
      for (var key in object) {
        if (!Object.hasOwnProperty.call(object, key)) {
          continue
        }

        bytes += sizeOf(key)
        try {
          bytes += sizeOf(object[key])
        } catch (ex) {
          if (ex instanceof RangeError) {
                        // circular reference detected, final result might be incorrect
                        // let's be nice and not throw an exception
            bytes = 0
          }
        }
      }
      return bytes
    }
  } else if (typeof (object) === 'string') {
    return object.length * 2
  } else if (typeof (object) === 'boolean') {
    return 4
  } else if (typeof (object) === 'number') {
    return 8
  } else {
    return 0
  }
}

function formatByteSize (bytes) {
  if (bytes < 1024) return bytes + ' bytes'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + ' KiB'
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + ' MiB'
  else return (bytes / 1073741824).toFixed(3) + ' GiB'
}

const NetworkStats = {
  previousDataSent: 0,
  previousDataReceived: 0,

  getDataPerSecond: function (dataSent, dataReceived) {
    const dataSentPerSecond = dataSent - this.previousDataSent
    this.previousDataSent = dataSent

    const dataReceivedPerSecond = dataReceived - this.previousDataReceived
    this.previousDataReceived = dataReceived

    return {
      dataSentPerSecond: dataSentPerSecond,
      dataReceivedPerSecond: dataReceivedPerSecond
    }
  },

  loop: function (callback) {
    if (callback && typeof callback === 'function') {
      setInterval(function () {
        callback()
      }, 1000)
    }
  },

  print: function (dataSent, dataReceived) {
    const data = this.getDataPerSecond(dataSent, dataReceived)

    console.log(
      'dataSent:', formatByteSize(dataSent),
      'dataReceived:', formatByteSize(dataReceived),
      'dataSent/sec:', formatByteSize(data.dataSentPerSecond),
      'dataReceived/sec:', formatByteSize(data.dataReceivedPerSecond)
    )
  }
}

module.exports.sizeOf = sizeOf
module.exports.formatByteSize = formatByteSize
module.exports.NetworkStats = NetworkStats
module.exports.guid = guid
