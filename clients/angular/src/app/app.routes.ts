import { Routes } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PairDeviceComponent } from './components/pair-device/pair-device.component';
import { PairingStatusComponent } from './components/pairing-status/pairing-status.component';
import { DeviceInfoComponent } from './components/device-info/device-info.component';
import { SensorsComponent } from './components/sensors/sensors.component';
import { DiagnosticsComponent } from './components/diagnostics/diagnostics.component';
import { Notfound } from './components/notfound/notfound';

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pair-device', component: PairDeviceComponent },
  { path: 'pairing-status', component: PairingStatusComponent },
  { path: 'device-info', component: DeviceInfoComponent },
  { path: 'sensors', component: SensorsComponent },
  { path: 'diagnostics', component: DiagnosticsComponent },
  { path: '**', component: Notfound },
];
