export interface SensorData {
  id: string;
  deviceId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  pressure?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
}

export interface SensorReading {
  temperature: number;
  humidity: number;
  timestamp: Date;
  unit: 'C' | 'F';
}

export interface SensorAlert {
  id: string;
  type: 'TEMPERATURE' | 'HUMIDITY' | 'PRESSURE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface SensorCalibration {
  lastCalibrated: Date;
  nextCalibration: Date;
  calibrationStatus: 'OK' | 'WARNING' | 'ERROR';
}
