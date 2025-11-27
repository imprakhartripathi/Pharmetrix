import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, map, switchMap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SensorData, SensorReading, SensorAlert, SensorCalibration } from '../models/sensor.model';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private currentReadingSubject = new BehaviorSubject<SensorReading | null>(null);
  currentReading$ = this.currentReadingSubject.asObservable();

  private sensorsSubject = new BehaviorSubject<SensorData[]>([]);
  sensors$ = this.sensorsSubject.asObservable();

  private alertsSubject = new BehaviorSubject<SensorAlert[]>([]);
  alerts$ = this.alertsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getSensorData(deviceId: string): Observable<SensorData> {
    if (environment.demo) {
      return this.simulateSensorData();
    }

    console.log('Fetching sensor data for device:', deviceId);
    return this.http.get<SensorData>(
      `${environment.apiBaseUrl}${environment.apiEndpoints.sensors}/${deviceId}`
    ).pipe(
      map(data => {
        this.updateReading(data);
        console.log('Sensor data received:', data);
        return data;
      }),
      catchError(error => {
        console.error('Error fetching sensor data:', error);
        throw error;
      })
    );
  }

  autoRefreshSensors(deviceId: string, intervalMs: number = 5000): Observable<SensorData> {
    if (environment.demo) {
      return interval(intervalMs).pipe(
        switchMap(() => this.simulateSensorData()),
        map(data => {
          this.updateReading(data);
          return data;
        })
      );
    }

    return interval(intervalMs).pipe(
      switchMap(() => this.getSensorData(deviceId))
    );
  }

  getSensorHistory(deviceId: string, hours: number = 24): Observable<SensorData[]> {
    if (environment.demo) {
      return this.simulateSensorHistory(hours);
    }

    console.log(`Fetching sensor history for device ${deviceId} (last ${hours} hours)`);
    return this.http.get<SensorData[]>(
      `${environment.apiBaseUrl}/sensors/history/${deviceId}?hours=${hours}`
    ).pipe(
      catchError(error => {
        console.error('Error fetching sensor history:', error);
        throw error;
      })
    );
  }

  getAlerts(deviceId: string): Observable<SensorAlert[]> {
    if (environment.demo) {
      return this.simulateAlerts();
    }

    console.log('Fetching alerts for device:', deviceId);
    return this.http.get<SensorAlert[]>(
      `${environment.apiBaseUrl}/sensors/alerts/${deviceId}`
    ).pipe(
      map(alerts => {
        this.alertsSubject.next(alerts);
        console.log('Alerts received:', alerts);
        return alerts;
      }),
      catchError(error => {
        console.error('Error fetching alerts:', error);
        throw error;
      })
    );
  }

  getCalibrationStatus(deviceId: string): Observable<SensorCalibration> {
    if (environment.demo) {
      return this.simulateCalibration();
    }

    console.log('Fetching calibration status for device:', deviceId);
    return this.http.get<SensorCalibration>(
      `${environment.apiBaseUrl}/sensors/calibration/${deviceId}`
    ).pipe(
      catchError(error => {
        console.error('Error fetching calibration status:', error);
        throw error;
      })
    );
  }

  triggerCalibration(deviceId: string): Observable<void> {
    console.log('Triggering calibration for device:', deviceId);
    return this.http.post<void>(
      `${environment.apiBaseUrl}/sensors/calibrate/${deviceId}`,
      {}
    ).pipe(
      catchError(error => {
        console.error('Error triggering calibration:', error);
        throw error;
      })
    );
  }

  getCurrentReading(): SensorReading | null {
    return this.currentReadingSubject.value;
  }

  private updateReading(data: SensorData): void {
    const reading: SensorReading = {
      temperature: data.temperature,
      humidity: data.humidity,
      timestamp: new Date(data.timestamp),
      unit: 'C'
    };
    this.currentReadingSubject.next(reading);
  }

  private simulateSensorData(): Observable<SensorData> {
    console.log('[DEMO] Simulating sensor data');
    
    return new Observable(observer => {
      setTimeout(() => {
        const data: SensorData = {
          id: `sensor-${Date.now()}`,
          deviceId: 'demo-device',
          timestamp: new Date(),
          temperature: 22 + (Math.random() - 0.5) * 5,
          humidity: 45 + (Math.random() - 0.5) * 20,
          pressure: 1013 + (Math.random() - 0.5) * 10,
          status: 'ACTIVE'
        };
        observer.next(data);
        observer.complete();
      }, 300);
    });
  }

  private simulateSensorHistory(hours: number): Observable<SensorData[]> {
    console.log(`[DEMO] Simulating sensor history (${hours} hours)`);
    
    return new Observable(observer => {
      setTimeout(() => {
        const history: SensorData[] = [];
        const now = Date.now();
        const interval = (hours * 3600000) / 10;

        for (let i = 0; i < 10; i++) {
          history.push({
            id: `sensor-history-${i}`,
            deviceId: 'demo-device',
            timestamp: new Date(now - (10 - i) * interval),
            temperature: 20 + Math.random() * 5,
            humidity: 40 + Math.random() * 30,
            status: 'ACTIVE'
          });
        }

        observer.next(history);
        observer.complete();
      }, 500);
    });
  }

  private simulateAlerts(): Observable<SensorAlert[]> {
    console.log('[DEMO] Simulating sensor alerts');
    
    return new Observable(observer => {
      setTimeout(() => {
        const alerts: SensorAlert[] = [
          {
            id: 'alert-1',
            type: 'TEMPERATURE',
            severity: 'HIGH',
            message: 'Temperature exceeds normal range',
            timestamp: new Date(),
            resolved: false
          },
          {
            id: 'alert-2',
            type: 'HUMIDITY',
            severity: 'MEDIUM',
            message: 'Humidity levels changing rapidly',
            timestamp: new Date(Date.now() - 3600000),
            resolved: false
          }
        ];
        this.alertsSubject.next(alerts);
        observer.next(alerts);
        observer.complete();
      }, 400);
    });
  }

  private simulateCalibration(): Observable<SensorCalibration> {
    console.log('[DEMO] Simulating calibration status');
    
    return new Observable(observer => {
      setTimeout(() => {
        const calibration: SensorCalibration = {
          lastCalibrated: new Date(Date.now() - 30 * 24 * 3600000),
          nextCalibration: new Date(Date.now() + 30 * 24 * 3600000),
          calibrationStatus: 'OK'
        };
        observer.next(calibration);
        observer.complete();
      }, 300);
    });
  }
}
