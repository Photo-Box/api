const path = require('path')

const Constants = {
  StatusBody: {
    BadAuth: {
      status: 401,
      type: 1,
      message: 'Invalid Authentication.'
    },
    BadPerms: (perm, prefix) => ({
      status: 401,
      type: 2,
      message: 'Missing Permission: ' + (prefix ? prefix + '.' : '') + perm
    }),
    InvalidSchema: e => ({
      status: 400,
      type: 3,
      message: e
    }),
    InvalidFileType: resource => ({
      status: 400,
      type: 4,
      message: `The file type ${resource.headers['content-type']} is not supported`,
      availableFileTypes: Constants.AllowedFileTypes,
      resource: {
        url: resource.url,
        status: resource.status,
        statusText: resource.statusText,
        headers: resource.headers
      }
    }),
    ResourceError: resource => ({
      status: 400,
      type: 4,
      message: `The requested resource "${resource.url}" gave an error`,
      resource: {
        url: resource.url,
        status: resource.status,
        statusText: resource.statusText,
        headers: resource.headers
      }
    }),
    BadBody: detail => ({
      status: 400,
      type: 1000,
      message: 'Invalid Body. ' + detail
    }),
    ImageProcessError: e => ({
      status: 500,
      type: 1001,
      message: e
    })
  },
  AllowedFileTypes: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/bmp'
  ],
  get assetPath(){
    return path.join(__dirname, '..', 'assets')
  }
}

module.exports = Constants