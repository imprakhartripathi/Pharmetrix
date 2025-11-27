import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { DeviceInfoService } from '../../services/device-info.service';
import { DeviceInfo } from '../../models/device.model';

@Component({
  selector: 'app-device-info',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './device-info.component.html',
  styleUrls: ['./device-info.component.scss']
})
export class DeviceInfoComponent implements OnInit, OnDestroy {
  deviceInfo: DeviceInfo | null = null;
  isLoading = false;
  autoRefreshEnabled = false;

  private destroy$ = new Subject<void>();

  constructor(private deviceInfoService: DeviceInfoService) {}

  ngOnInit(): void {
    this.loadDeviceInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDeviceInfo(): void {
    this.isLoading = true;
    this.deviceInfoService.getDeviceInfo('current').subscribe({
      next: (info) => {
        this.deviceInfo = info;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading device info:', error);
        this.isLoading = false;
      }
    });
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    }
  }

  private startAutoRefresh(): void {
    this.deviceInfoService.autoRefreshDeviceInfo('current', 10000)
      .subscribe({
        next: (info) => {
          this.deviceInfo = info;
        },
        error: (error) => {
          console.error('Error during auto-refresh:', error);
          this.autoRefreshEnabled = false;
        }
      });
  }

  getUptimeText(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }
}
