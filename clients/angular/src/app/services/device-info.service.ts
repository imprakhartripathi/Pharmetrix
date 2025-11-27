import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, map, switchMap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Device, DeviceInfo } from '../models/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceInfoService {
  private deviceInfoSubject = new BehaviorSubject<DeviceInfo | null>(null);
  deviceInfo$ = this.deviceInfoSubject.asObservable();

  constructor(private http: HttpClient) {}

  getDeviceInfo(deviceId: string): Observable<DeviceInfo> {
    if (environment.demo) {
      return this.simulateDeviceInfo();
    }

    console.log('Fetching device info for:', deviceId);
    return this.http.get<DeviceInfo>(
      `${environment.apiBaseUrl}${environment.apiEndpoints.deviceInfo}/${deviceId}`
    ).pipe(
      map(info => {
        this.deviceInfoSubject.next(info);
        console.log('Device info received:', info);
        return info;
      }),
      catchError(error => {
        console.error('Error fetching device info:', error);
        throw error;
      })
    );
  }

  autoRefreshDeviceInfo(deviceId: string, intervalMs: number = 10000) {
    if (environment.demo) {
      return interval(intervalMs).pipe(
        switchMap(() => this.simulateDeviceInfo()),
        map(info => {
          this.deviceInfoSubject.next(info);
          return info;
        })
      );
    }

    return interval(intervalMs).pipe(
      switchMap(() => this.getDeviceInfo(deviceId))
    );
  }

  private simulateDeviceInfo(): Observable<DeviceInfo> {
    console.log('[DEMO] Simulating device info fetch');

    return new Observable(observer => {
      setTimeout(() => {
        const info: DeviceInfo = {
          serialNumber: 'PM-RPI-001',
          model: 'Pharmetrix PI v1.0',
          hardwareVersion: '1.0',
          firmwareVersion: '2.3.1',
          uptime: Math.floor(Math.random() * 1000000),
          memoryUsage: Math.random() * 100,
          cpuUsage: Math.random() * 100,
          diskUsage: Math.random() * 100
        };

        this.deviceInfoSubject.next(info);
        observer.next(info);
        observer.complete();
      }, 300);
    });
  }

  getCurrentDeviceInfo(): DeviceInfo | null {
    return this.deviceInfoSubject.value;
  }
}
