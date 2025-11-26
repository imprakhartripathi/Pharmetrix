import React, { useState, useEffect, useRef } from 'react';

interface PiDevice {
  id: string;
  name: string;
  status: 'online' | 'offline';
}

const Streaming: React.FC = () => {
  const [piId, setPiId] = useState<string>('');
  const [selectedPi, setSelectedPi] = useState<PiDevice | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [live, setLive] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data for demo - Replace this with your actual API call
  const availablePis: PiDevice[] = [
    { id: 'pi_001', name: 'Kitchen Camera', status: 'online' },
    { id: 'pi_002', name: 'Living Room Camera', status: 'online' },
    { id: 'pi_003', name: 'Garage Camera', status: 'offline' },
    { id: 'pi_004', name: 'Front Door Camera', status: 'online' },
  ];

  const getToken = () => localStorage.getItem('token');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const connectWebSocket = (id: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setStatus('Connecting...');
    const ws = new WebSocket(`ws://localhost:4000/${id}/live/feed`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'frame' && imgRef.current) {
          imgRef.current.src = `data:image/jpeg;base64,${msg.data}`;
        } else if (msg.type === 'status') {
          setLive(msg.data.live);
        }
      } catch (err) {
        console.error('WS message parse error:', err);
      }
    };

    ws.onclose = () => {
      setStatus('Disconnected');
      setLive(false);
    };

    ws.onerror = () => {
      setStatus('Error');
    };
  };

  const fetchStatus = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:4000/${id}/live`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setLive(data.live);
      }
    } catch (err) {
      console.error('Fetch status error:', err);
    }
  };

  const toggleFeed = async () => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:4000/${piId}/live/toggleFeed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ toggleFeed: !live }),
      });
      if (res.ok) {
        setLive(!live);
      }
    } catch (err) {
      console.error('Toggle feed error:', err);
    }
  };

  const handlePiSelect = (pi: PiDevice) => {
    setSelectedPi(pi);
    setPiId(pi.id);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (piId) {
      connectWebSocket(piId);
      fetchStatus(piId);
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [piId]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', color: '#283593' }}>Live Camera Streaming</h1>
      
      {/* Pi Selection Dropdown */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3F51B5' }}>
          Select Raspberry Pi:
        </label>
        <div ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #3F51B5',
              borderRadius: '4px',
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <span>{selectedPi ? selectedPi.name : 'Select a Pi device...'}</span>
            <span 
              style={{
                display: 'inline-block',
                width: 0,
                height: 0,
                marginLeft: '8px',
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '6px solid #3F51B5',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              {availablePis.map((pi) => (
                <div
                  key={pi.id}
                  onClick={() => handlePiSelect(pi)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: selectedPi?.id === pi.id ? '#f5f5f5' : 'white',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPi?.id !== pi.id) {
                      e.currentTarget.style.backgroundColor = '#fafafa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPi?.id !== pi.id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                        {pi.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        ID: {pi.id}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500',
                        backgroundColor: pi.status === 'online' ? '#d4edda' : '#f8d7da',
                        color: pi.status === 'online' ? '#155724' : '#721c24',
                      }}>
                        {pi.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status and Controls */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '16px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '4px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Connection Status:</strong> <span style={{ 
            color: status === 'Connected' ? '#155724' : status === 'Error' ? '#721c24' : '#856404' 
          }}>{status}</span>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <strong>Live Feed:</strong> <span style={{ 
            color: live ? '#155724' : '#721c24' 
          }}>{live ? 'Active' : 'Inactive'}</span>
        </div>
        <button 
          onClick={toggleFeed} 
          disabled={!piId}
          style={{
            padding: '10px 20px',
            backgroundColor: !piId ? '#3F51B5' : (live ? '#dc3545' : '#28a745'),
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !piId ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {live ? 'Stop Feed' : 'Start Feed'}
        </button>
      </div>

      {/* Video Stream */}
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '4px', 
        overflow: 'hidden',
        backgroundColor: '#000',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          ref={imgRef} 
          alt="Live Stream" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '600px',
            display: 'block'
          }} 
        />
      </div>
    </div>
  );
};

export default Streaming;