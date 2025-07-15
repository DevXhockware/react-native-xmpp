'use strict';

import { Platform, NativeModules, NativeEventEmitter } from 'react-native';

const RNXMPP = NativeModules.RNXMPP;
const emitter = new NativeEventEmitter(RNXMPP);

const map = {
  message: 'RNXMPPMessage',
  iq: 'RNXMPPIQ',
  presence: 'RNXMPPPresence',
  connect: 'RNXMPPConnect',
  disconnect: 'RNXMPPDisconnect',
  error: 'RNXMPPError',
  loginError: 'RNXMPPLoginError',
  login: 'RNXMPPLogin',
  roster: 'RNXMPPRoster',
};

const LOG = message => {
  if (__DEV__) {
    console.log('react-native-xmpp: ' + message);
  }
};

class XMPP {
  PLAIN = RNXMPP.PLAIN;
  SCRAM = RNXMPP.SCRAMSHA1;
  MD5 = RNXMPP.DigestMD5;

  constructor() {
    this.isConnected = false;
    this.isLogged = false;
    this.listeners = [
      emitter.addListener(map.connect, this.onConnected.bind(this)),
      emitter.addListener(map.disconnect, this.onDisconnected.bind(this)),
      emitter.addListener(map.error, this.onError.bind(this)),
      emitter.addListener(map.loginError, this.onLoginError.bind(this)),
      emitter.addListener(map.login, this.onLogin.bind(this)),
    ];
  }

  onConnected() {
    LOG('Connected');
    this.isConnected = true;
  }

  onLogin() {
    LOG('Login');
    this.isLogged = true;
  }

  onDisconnected(error) {
    LOG('Disconnected, error: ' + error);
    this.isConnected = false;
    this.isLogged = false;
  }

  onError(text) {
    LOG('Error: ' + text);
  }

  onLoginError(text) {
    this.isLogged = false;
    LOG('LoginError: ' + text);
  }

  on(type, callback) {
    if (map[type]) {
      const listener = emitter.addListener(map[type], callback);
      this.listeners.push(listener);
      return listener;
    } else {
      throw 'No registered type: ' + type;
    }
  }

  removeListener(type) {
    if (map[type]) {
      this.listeners = this.listeners.filter(listener => {
        if (listener.eventType === map[type]) {
          listener.remove();
          LOG(`Event listener of type "${type}" removed`);
          return false;
        }
        return true;
      });
    }
  }

  removeListeners() {
    this.listeners.forEach(listener => listener.remove());
    this.listeners = [
      emitter.addListener(map.connect, this.onConnected.bind(this)),
      emitter.addListener(map.disconnect, this.onDisconnected.bind(this)),
      emitter.addListener(map.error, this.onError.bind(this)),
      emitter.addListener(map.loginError, this.onLoginError.bind(this)),
      emitter.addListener(map.login, this.onLogin.bind(this)),
    ];
    LOG('All event listeners removed');
  }

  trustHosts(hosts) {
    RNXMPP.trustHosts(hosts);
  }

  connect(username, password, auth = RNXMPP.SCRAMSHA1, hostname = null, port = 5222) {
    if (!hostname) {
      hostname = (username + '@/').split('@')[1].split('/')[0];
    }
    RNXMPP.connect(username, password, auth, hostname, port);
  }

  message(text, user, thread = null) {
    LOG(`Message: "${text}" being sent to user: ${user}`);
    RNXMPP.message(text, user, thread);
  }

  sendStanza(stanza) {
    RNXMPP.sendStanza(stanza);
  }

  fetchRoster() {
    RNXMPP.fetchRoster();
  }

  presence(to, type) {
    RNXMPP.presence(to, type);
  }

  removeFromRoster(to) {
    RNXMPP.removeRoster(to);
  }

  disconnect() {
    if (this.isConnected) {
      RNXMPP.disconnect();
    }
  }

  disconnectAfterSending() {
    if (this.isConnected) {
      RNXMPP.disconnectAfterSending();
    }
  }
}

module.exports = new XMPP();
