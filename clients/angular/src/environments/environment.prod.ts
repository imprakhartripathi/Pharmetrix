export const environment = {
  production: true,
  demo: false,
  apiBaseUrl: 'https://api.pharmetrix.com',
  apiEndpoints: {
    pair: '/device/pair',
    pairingStatus: '/device/pairing-status',
    deviceInfo: '/device/info',
    ping: '/network/ping',
    dns: '/network/dns',
    port: '/network/port',
    sensors: '/sensors/data'
  }
};
