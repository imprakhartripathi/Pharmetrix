import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval, takeUntil, switchMap, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PairingRequest, PairingResponse } from '../models/device.model';
import { PairingSession, PairingStatus, PairingPollingConfig, PairingResult } from '../models/pairing.model';

@Injectable({
  providedIn: 'root'
})
export class PairingService {
  private readonly POLLING_CONFIG: PairingPollingConfig = {
    maxAttempts: 60,
    pollInterval: 5000,
    timeoutMs: 300000
  };

  pairingStatus$ = new Subject<PairingStatus>();
  currentPairingId = signal<string | null>(null);
  currentToken = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  pairDevice(request: PairingRequest): Observable<PairingResponse> {
    if (environment.demo) {
      return this.simulatePairing(request);
    }

    console.log('Sending pairing request:', request);
    return this.http.post<PairingResponse>(
      `${environment.apiBaseUrl}${environment.apiEndpoints.pair}`,
      request
    ).pipe(
      map(response => {
        if (response.pairingId) {
          this.currentPairingId.set(response.pairingId);
          console.log('Pairing initiated:', response);
        }
        return response;
      }),
      catchError(error => {
        console.error('Pairing error:', error);
        throw error;
      })
    );
  }

  pollPairingStatus(pairingId: string, destroy$: Subject<void>): Observable<PairingResponse> {
    if (environment.demo) {
      return this.simulatePolling(pairingId);
    }

    console.log('Starting polling for pairing ID:', pairingId);
    
    return interval(this.POLLING_CONFIG.pollInterval).pipe(
      switchMap(() => 
        this.http.get<PairingResponse>(
          `${environment.apiBaseUrl}${environment.apiEndpoints.pairingStatus}?pairingId=${pairingId}`
        )
      ),
      takeUntil(destroy$),
      map(response => {
        this.pairingStatus$.next(response.status as PairingStatus);
        console.log('Polling response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Polling error:', error);
        throw error;
      })
    );
  }

  private simulatePairing(request: PairingRequest): Observable<PairingResponse> {
    const result = prompt('Simulate pairing success? (true/false)', 'true');
    const success = result === 'true';

    console.log(`[DEMO] Simulating /device/pair`);
    console.log('Pairing request:', request);

    return new Observable(observer => {
      setTimeout(() => {
        const response: PairingResponse = success
          ? {
              status: 'PENDING_ADMIN_APPROVAL',
              pairingId: `demo-${Date.now()}`,
              message: 'Pairing initiated. Awaiting admin approval.'
            }
          : {
              status: 'ERROR',
              pairingId: '',
              error: 'Simulated pairing failure'
            };

        if (success && response.pairingId) {
          this.currentPairingId.set(response.pairingId);
        }

        observer.next(response);
        observer.complete();
      }, 500);
    });
  }

  private simulatePolling(pairingId: string): Observable<PairingResponse> {
    let pollCount = 0;

    return interval(this.POLLING_CONFIG.pollInterval).pipe(
      map(() => {
        pollCount++;
        console.log(`[DEMO] Polling attempt ${pollCount}/${this.POLLING_CONFIG.maxAttempts}`);

        const statuses: PairingStatus[] = [
          'PENDING_ADMIN_APPROVAL',
          'APPROVED_PENDING_CALLBACK',
          'APPROVED_AWAITING_POLL',
          'ACTIVE'
        ];

        const currentStatus = statuses[Math.min(pollCount - 1, statuses.length - 1)] as PairingStatus;

        const response: PairingResponse = {
          status: currentStatus,
          pairingId,
          token: currentStatus === 'ACTIVE' ? `token-${Date.now()}` : undefined,
          message: `Status: ${currentStatus}`
        };

        this.pairingStatus$.next(currentStatus);
        return response;
      }),
      takeUntil(
        interval(this.POLLING_CONFIG.timeoutMs).pipe(
          switchMap(() => {
            console.log('[DEMO] Polling timeout reached');
            return new Observable<PairingResponse>();
          })
        )
      )
    );
  }

  getPairingSession(pairingId: string): Observable<PairingSession> {
    return this.http.get<PairingSession>(
      `${environment.apiBaseUrl}/pairing/session/${pairingId}`
    );
  }

  cancelPairing(pairingId: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiBaseUrl}/pairing/cancel`,
      { pairingId }
    );
  }

  getToken(): string | null {
    return this.currentToken();
  }

  setToken(token: string): void {
    this.currentToken.set(token);
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.currentToken.set(null);
    localStorage.removeItem('auth_token');
  }
}
