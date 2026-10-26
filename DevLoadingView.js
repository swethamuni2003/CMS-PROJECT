'use strict';

let LoadingView;
try {
  LoadingView = require('react-native/Libraries/Utilities/LoadingView');
} catch (e) {
  LoadingView = {
    showMessage() {},
    hide() {},
  };
}

module.exports = LoadingView;
module.exports.default = LoadingView;
