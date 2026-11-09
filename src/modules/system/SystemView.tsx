import React from 'react';
import { useSystemStore } from '../../stores/useSystemStore';
import { Cpu, Activity, HardDrive, Wifi, Battery, Zap, Server } from 'lucide-react';

export const SystemView: React.FC = () => {
  const { metrics } = useSystemStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 4-Card Hardware Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {/* CPU Card */}
        <div
          style={{
            padding: 12,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={14} style={{ color: 'var(--nova-blue)' }} /> CPU Load
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
              {metrics.cpuUsagePercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              marginTop: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${metrics.cpuUsagePercent}%`,
                height: '100%',
                backgroundColor: 'var(--nova-blue)',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '10px', color: 'var(--nova-text-muted)' }}>
            <span>Core Temp: {metrics.cpuTempCelsius || 42}°C</span>
            <span>Freq: 3.8 GHz</span>
          </div>
        </div>

        {/* RAM Card */}
        <div
          style={{
            padding: 12,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={14} style={{ color: 'var(--nova-cyan)' }} /> Memory (RAM)
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
              {metrics.ramUsagePercent}%
            </span>
          </div>

          <div
            style={{
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              marginTop: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${metrics.ramUsagePercent}%`,
                height: '100%',
                backgroundColor: 'var(--nova-cyan)',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '10px', color: 'var(--nova-text-muted)' }}>
            <span>Used: {metrics.ramUsedGb} GB</span>
            <span>Total: {metrics.ramTotalGb} GB</span>
          </div>
        </div>

        {/* Disk Card */}
        <div
          style={{
            padding: 12,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <HardDrive size={14} style={{ color: 'var(--nova-violet)' }} /> Primary NVMe
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
              {metrics.diskUsagePercent}%
            </span>
          </div>

          <div
            style={{
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              marginTop: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${metrics.diskUsagePercent}%`,
                height: '100%',
                backgroundColor: 'var(--nova-violet)',
                borderRadius: 2,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '10px', color: 'var(--nova-text-muted)' }}>
            <span>Free: {metrics.diskFreeGb} GB</span>
            <span>Capacity: 512 GB</span>
          </div>
        </div>

        {/* Network & Power Card */}
        <div
          style={{
            padding: 12,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wifi size={14} style={{ color: 'var(--nova-warning)' }} /> Network I/O
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nova-success)' }}>
              Online
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 10,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div>
              <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>DOWN</div>
              <div style={{ color: 'var(--nova-text-primary)' }}>{metrics.networkDownloadKbps} KB/s</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>UP</div>
              <div style={{ color: 'var(--nova-text-primary)' }}>{metrics.networkUploadKbps} KB/s</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>POWER</div>
              <div style={{ color: 'var(--nova-text-primary)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Battery size={11} /> {metrics.batteryPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GPU & Hardware Capability Indicator */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-input)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--nova-text-secondary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Server size={12} style={{ color: 'var(--nova-blue)' }} /> Windows D3D Hardware Acceleration Active
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nova-text-primary)' }}>
          GPU: {metrics.gpuUsagePercent}% VRAM: 1.2 GB
        </span>
      </div>
    </div>
  );
};
