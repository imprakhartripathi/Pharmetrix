export const environment = {
  production: false,
  demo: true,
  apiBaseUrl: 'http://localhost:3000',
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
