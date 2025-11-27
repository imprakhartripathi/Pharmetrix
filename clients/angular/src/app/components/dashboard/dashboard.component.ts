import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { PairingService } from '../../services/pairing.service';
import { PairDeviceComponent } from '../pair-device/pair-device.component';
import { DeviceInfoComponent } from '../device-info/device-info.component';
import { SensorsComponent } from '../sensors/sensors.component';
import { DiagnosticsComponent } from '../diagnostics/diagnostics.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    PairDeviceComponent,
    DeviceInfoComponent,
    SensorsComponent,
    DiagnosticsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isPaired = false;
  currentStep: 'pairing' | 'active' = 'pairing';

  constructor(private pairingService: PairingService) {}

  ngOnInit(): void {
    this.checkPairingStatus();
  }

  ngOnDestroy(): void {}

  private checkPairingStatus(): void {
    const token = this.pairingService.getToken();
    this.isPaired = !!token;
    this.currentStep = this.isPaired ? 'active' : 'pairing';
  }

  onPairingSuccess(): void {
    this.isPaired = true;
    this.currentStep = 'active';
  }

  reset(): void {
    this.isPaired = false;
    this.currentStep = 'pairing';
    this.pairingService.clearToken();
  }
}
