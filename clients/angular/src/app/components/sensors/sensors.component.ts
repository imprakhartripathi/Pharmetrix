import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject } from 'rxjs';
import { SensorService } from '../../services/sensor.service';
import { SensorReading, SensorAlert } from '../../models/sensor.model';

@Component({
  selector: 'app-sensors',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss']
})
export class SensorsComponent implements OnInit, OnDestroy {
  currentReading: SensorReading | null = null;
  alerts: SensorAlert[] = [];
  isLoading = false;
  autoRefreshEnabled = false;

  private destroy$ = new Subject<void>();

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    this.loadSensorData();
    this.loadAlerts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSensorData(): void {
    this.isLoading = true;
    this.sensorService.getSensorData('current').subscribe({
      next: (data) => {
        this.currentReading = {
          temperature: data.temperature,
          humidity: data.humidity,
          timestamp: new Date(data.timestamp),
          unit: 'C'
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sensor data:', error);
        this.isLoading = false;
      }
    });
  }

  loadAlerts(): void {
    this.sensorService.getAlerts('current').subscribe({
      next: (alerts) => {
        this.alerts = alerts.filter(a => !a.resolved);
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
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
    this.sensorService.autoRefreshSensors('current', 5000)
      .subscribe({
        next: (data) => {
          this.currentReading = {
            temperature: data.temperature,
            humidity: data.humidity,
            timestamp: new Date(data.timestamp),
            unit: 'C'
          };
        },
        error: (error) => {
          console.error('Error during auto-refresh:', error);
          this.autoRefreshEnabled = false;
        }
      });
  }

  getTemperatureColor(temp: number): string {
    if (temp < 15) return 'cold';
    if (temp < 25) return 'normal';
    if (temp < 35) return 'warm';
    return 'hot';
  }

  getHumidityStatus(humidity: number): string {
    if (humidity < 30) return 'low';
    if (humidity < 60) return 'normal';
    return 'high';
  }

  getAlertSeverityIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      default:
        return 'check_circle';
    }
  }

  dismissAlert(alertId: string): void {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }
}
