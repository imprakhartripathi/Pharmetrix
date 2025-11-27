export interface NetworkDiagnostic {
  id: string;
  timestamp: Date;
  diagnostics: {
    ping: PingResult;
    dns: DnsResult;
    port: PortTestResult;
  };
}

export interface PingResult {
  host: string;
  success: boolean;
  responseTime: number;
  packetLoss: number;
  message?: string;
}

export interface DnsResult {
  domain: string;
  success: boolean;
  resolvedIp?: string;
  responseTime: number;
  message?: string;
}

export interface PortTestResult {
  host: string;
  port: number;
  success: boolean;
  responseTime: number;
  message?: string;
}

export interface NetworkStatus {
  connectivity: boolean;
  signal: number;
  bandwidth: number;
  latency: number;
}
