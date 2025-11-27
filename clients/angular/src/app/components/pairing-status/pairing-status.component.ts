import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, interval, takeUntil, switchMap } from 'rxjs';
import { PairingService } from '../../services/pairing.service';
import { PairingStatus } from '../../models/pairing.model';

@Component({
  selector: 'app-pairing-status',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pairing-status.component.html',
  styleUrls: ['./pairing-status.component.scss']
})
export class PairingStatusComponent implements OnInit, OnDestroy {
  @Input() pairingId: string = '';
  @Output() statusComplete = new EventEmitter<void>();

  currentStatus: PairingStatus = 'PENDING_ADMIN_APPROVAL';
  statusMessage: string = '';
  progress: number = 0;
  isPolling = false;
  errorMessage: string = '';

  private destroy$ = new Subject<void>();
  private statusStages: PairingStatus[] = [
    'PENDING_ADMIN_APPROVAL',
    'APPROVED_PENDING_CALLBACK',
    'APPROVED_AWAITING_POLL',
    'ACTIVE'
  ];

  private statusMessages: Record<PairingStatus, string> = {
    'PENDING_ADMIN_APPROVAL': 'Awaiting admin approval...',
    'APPROVED_PENDING_CALLBACK': 'Admin approved. Callback pending...',
    'APPROVED_AWAITING_POLL': 'Awaiting final poll from device...',
    'ACTIVE': 'Device successfully paired!',
    'FAILED': 'Pairing failed',
    'EXPIRED': 'Pairing request expired'
  };

  constructor(private pairingService: PairingService) {}

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPolling(): void {
    this.isPolling = true;
    this.pairingService.pollPairingStatus(this.pairingId, this.destroy$)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.currentStatus = response.status as PairingStatus;
          this.statusMessage = this.statusMessages[this.currentStatus];
          this.updateProgress();

          if (this.currentStatus === 'ACTIVE') {
            this.isPolling = false;
            if (response.token) {
              this.pairingService.setToken(response.token);
            }
            setTimeout(() => {
              this.statusComplete.emit();
            }, 1000);
          }
        },
        error: (error) => {
          console.error('Polling error:', error);
          this.errorMessage = 'Error during pairing. Please try again.';
          this.isPolling = false;
        }
      });
  }

  private updateProgress(): void {
    const stageIndex = this.statusStages.indexOf(this.currentStatus);
    if (stageIndex !== -1) {
      this.progress = ((stageIndex + 1) / this.statusStages.length) * 100;
    }
  }

  retry(): void {
    this.errorMessage = '';
    this.progress = 0;
    this.currentStatus = 'PENDING_ADMIN_APPROVAL';
    this.startPolling();
  }

  cancel(): void {
    this.destroy$.next();
    this.statusComplete.emit();
  }

  getStatusIcon(): string {
    switch (this.currentStatus) {
      case 'PENDING_ADMIN_APPROVAL':
        return 'hourglass_empty';
      case 'APPROVED_PENDING_CALLBACK':
        return 'phone_callback';
      case 'APPROVED_AWAITING_POLL':
        return 'cloud_sync';
      case 'ACTIVE':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  get stagesArray(): PairingStatus[] {
    return this.statusStages;
  }
}
