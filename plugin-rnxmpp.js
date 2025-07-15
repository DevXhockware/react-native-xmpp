// plugin-rnxmpp.js
const { withAndroidManifest, withInfoPlist, withXcodeProject } = require('@expo/config-plugins');

function ensureInternetPermission(androidManifest) {
  const used = androidManifest.manifest?.usesPermissions?.some(
    p => p.$['android:name'] === 'android.permission.INTERNET'
  );
  if (!used) {
    androidManifest.manifest.usesPermissions = androidManifest.manifest.usesPermissions || [];
    androidManifest.manifest.usesPermissions.push({
      $: { 'android:name': 'android.permission.INTERNET' }
    });
  }
  return androidManifest;
}

function setCleartext(androidManifest) {
  const app = androidManifest.manifest.application?.[0];
  if (app) app.$['android:usesCleartextTraffic'] = 'true';
  return androidManifest;
}

module.exports = function withRnxmpp(config) {
  return withXcodeProject(
    withInfoPlist(
      withAndroidManifest(config, config => {
        return ensureInternetPermission(setCleartext(config.modResults));
      })
    ),
    config => {
      // iOS: nothing extra—plugin ensures Pod is included
      return config;
    }
  );
};

module.exports = {
  plugin: module.exports,
};
