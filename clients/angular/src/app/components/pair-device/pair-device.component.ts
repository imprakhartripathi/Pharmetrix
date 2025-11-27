import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { Subject } from 'rxjs';
import { PairingService } from '../../services/pairing.service';
import { PairingRequest } from '../../models/device.model';
import { PairingStatusComponent } from '../pairing-status/pairing-status.component';

@Component({
  selector: 'app-pair-device',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    PairingStatusComponent
  ],
  templateUrl: './pair-device.component.html',
  styleUrls: ['./pair-device.component.scss']
})
export class PairDeviceComponent implements OnDestroy {
  @Output() pairingSuccess = new EventEmitter<void>();

  pairingForm: FormGroup;
  isSubmitting = false;
  showStatusMonitor = false;
  currentPairingId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private pairingService: PairingService
  ) {
    this.pairingForm = this.createForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      serialNumber: ['', [Validators.required, Validators.minLength(5)]],
      accessPoint: ['', [Validators.required]],
      imei: ['', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      imsi: ['', [Validators.required, Validators.pattern(/^\d{15}$/)]],
      pairingId: ['', [Validators.required]]
    });
  }

  autoPopulateAP(): void {
    const ap = Math.random().toString(36).substring(2, 15);
    this.pairingForm.patchValue({ accessPoint: ap });
  }

  autoPopulateIM(): void {
    const imei = Math.floor(Math.random() * 9000000000000000 + 1000000000000000).toString();
    const imsi = Math.floor(Math.random() * 9000000000000000 + 1000000000000000).toString();
    this.pairingForm.patchValue({
      imei,
      imsi
    });
  }

  generatePairingId(): void {
    const id = `PM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    this.pairingForm.patchValue({ pairingId: id });
  }

  submitPairing(): void {
    if (this.pairingForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const request: PairingRequest = this.pairingForm.value;

    this.pairingService.pairDevice(request).subscribe({
      next: (response) => {
        if (response.pairingId) {
          this.currentPairingId = response.pairingId;
          this.showStatusMonitor = true;
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Pairing error:', error);
        this.isSubmitting = false;
      }
    });
  }

  onStatusComplete(): void {
    this.pairingSuccess.emit();
  }

  resetForm(): void {
    this.pairingForm.reset();
    this.showStatusMonitor = false;
    this.currentPairingId = null;
  }
}
