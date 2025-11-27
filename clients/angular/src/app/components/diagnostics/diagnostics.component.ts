import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { NetworkService } from '../../services/network.service';
import { PingResult, DnsResult, PortTestResult } from '../../models/network.model';

interface DiagnosticTest {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: PingResult | DnsResult | PortTestResult | null;
  error?: string;
}

@Component({
  selector: 'app-diagnostics',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.scss']
})
export class DiagnosticsComponent implements OnInit, OnDestroy {
  tests: DiagnosticTest[] = [
    { name: 'Ping Test', status: 'pending' },
    { name: 'DNS Check', status: 'pending' },
    { name: 'Port Test', status: 'pending' }
  ];

  isRunning = false;
  overallStatus: 'idle' | 'running' | 'completed' | 'failed' = 'idle';
  completedTests = 0;

  private destroy$ = new Subject<void>();

  constructor(private networkService: NetworkService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  runDiagnostics(): void {
    this.resetTests();
    this.isRunning = true;
    this.overallStatus = 'running';

    this.runPingTest();
  }

  private resetTests(): void {
    this.tests = this.tests.map(t => ({
      ...t,
      status: 'pending',
      result: undefined,
      error: undefined
    }));
    this.completedTests = 0;
  }

  private runPingTest(): void {
    const test = this.tests[0];
    if (!test) return;

    test.status = 'running';

    this.networkService.ping('8.8.8.8').subscribe({
      next: (result) => {
        test.result = result;
        test.status = result.success ? 'completed' : 'failed';
        this.completedTests++;
        this.runDnsTest();
      },
      error: (error) => {
        test.error = error.message;
        test.status = 'failed';
        this.completedTests++;
        this.runDnsTest();
      }
    });
  }

  private runDnsTest(): void {
    const test = this.tests[1];
    if (!test) return;

    test.status = 'running';

    this.networkService.dnsCheck('google.com').subscribe({
      next: (result) => {
        test.result = result;
        test.status = result.success ? 'completed' : 'failed';
        this.completedTests++;
        this.runPortTest();
      },
      error: (error) => {
        test.error = error.message;
        test.status = 'failed';
        this.completedTests++;
        this.runPortTest();
      }
    });
  }

  private runPortTest(): void {
    const test = this.tests[2];
    if (!test) return;

    test.status = 'running';

    this.networkService.portTest('localhost', 3000).subscribe({
      next: (result) => {
        test.result = result;
        test.status = result.success ? 'completed' : 'failed';
        this.completedTests++;
        this.finalizeDiagnostics();
      },
      error: (error) => {
        test.error = error.message;
        test.status = 'failed';
        this.completedTests++;
        this.finalizeDiagnostics();
      }
    });
  }

  private finalizeDiagnostics(): void {
    this.isRunning = false;
    const allPassed = this.tests.every(t => t.status === 'completed');
    this.overallStatus = allPassed ? 'completed' : 'failed';
  }

  getTestIcon(status: string): string {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'running':
        return 'hourglass_empty';
      case 'completed':
        return 'check_circle';
      case 'failed':
        return 'error';
      default:
        return 'help';
    }
  }

  getTestIconColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'running':
        return 'accent';
      case 'completed':
        return 'primary';
      case 'failed':
        return 'warn';
      default:
        return '';
    }
  }

  getResultText(result: any): string {
    if (!result) return '';

    if ((result as PingResult).responseTime !== undefined) {
      const ping = result as PingResult;
      return `${ping.responseTime}ms response time`;
    }

    if ((result as DnsResult).resolvedIp !== undefined) {
      const dns = result as DnsResult;
      return `Resolved to ${dns.resolvedIp}`;
    }

    if ((result as PortTestResult).port !== undefined) {
      const port = result as PortTestResult;
      return `Port ${port.port} is ${port.success ? 'reachable' : 'unreachable'}`;
    }

    return '';
  }
}
