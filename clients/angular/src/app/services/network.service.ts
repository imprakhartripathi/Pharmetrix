import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PingResult, DnsResult, PortTestResult, NetworkStatus, NetworkDiagnostic } from '../models/network.model';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private networkStatusSubject = new BehaviorSubject<NetworkStatus>({
    connectivity: false,
    signal: 0,
    bandwidth: 0,
    latency: 0
  });

  networkStatus$ = this.networkStatusSubject.asObservable();

  constructor(private http: HttpClient) {}

  ping(host: string = '8.8.8.8'): Observable<PingResult> {
    if (environment.demo) {
      return this.simulatePing(host);
    }

    console.log('Pinging:', host);
    return this.http.post<PingResult>(
      `${environment.apiBaseUrl}${environment.apiEndpoints.ping}`,
      { host }
    ).pipe(
      map(result => {
        console.log('Ping result:', result);
        return result;
      }),
      catchError(error => {
        console.error('Ping error:', error);
        throw error;
      })
    );
  }

  dnsCheck(domain: string = 'google.com'): Observable<DnsResult> {
    if (environment.demo) {
      return this.simulateDns(domain);
    }

    console.log('DNS check for:', domain);
    return this.http.post<DnsResult>(
      `${environment.apiBaseUrl}${environment.apiEndpoints.dns}`,
      { domain }
    ).pipe(
      map(result => {
        console.log('DNS result:', result);
        return result;
      }),
      catchError(error => {
        console.error('DNS error:', error);
        throw error;
      })
    );
  }

  portTest(host: string, port: number): Observable<PortTestResult> {
    if (environment.demo) {
      return this.simulatePortTest(host, port);
    }

    console.log(`Testing port ${port} on ${host}`);
    return this.http.post<PortTestResult>(
      `${environment.apiBaseUrl}${environment.apiEndpoints.port}`,
      { host, port }
    ).pipe(
      map(result => {
        console.log('Port test result:', result);
        return result;
      }),
      catchError(error => {
        console.error('Port test error:', error);
        throw error;
      })
    );
  }

  runFullDiagnostics(): Observable<NetworkDiagnostic> {
    if (environment.demo) {
      return this.simulateFullDiagnostics();
    }

    console.log('Running full network diagnostics');
    return this.http.post<NetworkDiagnostic>(
      `${environment.apiBaseUrl}/network/diagnostics`,
      {}
    ).pipe(
      map(result => {
        console.log('Diagnostics result:', result);
        return result;
      }),
      catchError(error => {
        console.error('Diagnostics error:', error);
        throw error;
      })
    );
  }

  private simulatePing(host: string): Observable<PingResult> {
    console.log(`[DEMO] Simulating ping to ${host}`);
    
    return new Observable(observer => {
      setTimeout(() => {
        const result: PingResult = {
          host,
          success: Math.random() > 0.1,
          responseTime: Math.floor(Math.random() * 100) + 10,
          packetLoss: Math.random() * 5
        };
        observer.next(result);
        observer.complete();
      }, 500);
    });
  }

  private simulateDns(domain: string): Observable<DnsResult> {
    console.log(`[DEMO] Simulating DNS check for ${domain}`);
    
    return new Observable(observer => {
      setTimeout(() => {
        const result: DnsResult = {
          domain,
          success: Math.random() > 0.05,
          resolvedIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          responseTime: Math.floor(Math.random() * 50) + 5
        };
        observer.next(result);
        observer.complete();
      }, 400);
    });
  }

  private simulatePortTest(host: string, port: number): Observable<PortTestResult> {
    console.log(`[DEMO] Simulating port test ${host}:${port}`);
    
    return new Observable(observer => {
      setTimeout(() => {
        const result: PortTestResult = {
          host,
          port,
          success: Math.random() > 0.2,
          responseTime: Math.floor(Math.random() * 150) + 20
        };
        observer.next(result);
        observer.complete();
      }, 600);
    });
  }

  private simulateFullDiagnostics(): Observable<NetworkDiagnostic> {
    console.log('[DEMO] Simulating full network diagnostics');
    
    return new Observable(observer => {
      setTimeout(() => {
        const diagnostic: NetworkDiagnostic = {
          id: `diag-${Date.now()}`,
          timestamp: new Date(),
          diagnostics: {
            ping: {
              host: '8.8.8.8',
              success: Math.random() > 0.1,
              responseTime: Math.floor(Math.random() * 100) + 10,
              packetLoss: Math.random() * 5
            },
            dns: {
              domain: 'google.com',
              success: Math.random() > 0.05,
              resolvedIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              responseTime: Math.floor(Math.random() * 50) + 5
            },
            port: {
              host: 'localhost',
              port: 3000,
              success: Math.random() > 0.2,
              responseTime: Math.floor(Math.random() * 150) + 20
            }
          }
        };
        observer.next(diagnostic);
        observer.complete();
      }, 1000);
    });
  }
}
