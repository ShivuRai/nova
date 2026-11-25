import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

import { unitsConfig, type UnitType } from '../../services/units';

export const UnitsView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [unitType, setUnitType] = useState<UnitType>('length');
  const [inputValue, setInputValue] = useState<string>('100');
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('foot');
  const [copied, setCopied] = useState(false);

  const handleTypeChange = (type: UnitType) => {
    setUnitType(type);
    const available = unitsConfig[type].units;
    setFromUnit(available[0]);
    setToUnit(available[1] || available[0]);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const numVal = parseFloat(inputValue) || 0;
  const converted = unitsConfig[unitType].convert(numVal, fromUnit, toUnit);
  const formattedResult = Number.isInteger(converted)
    ? converted.toString()
    : converted.toFixed(4).replace(/\.?0+$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(`${formattedResult} ${toUnit}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: 320 }}>
      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {(['length', 'weight', 'temp', 'data', 'currency'] as UnitType[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: unitType === t ? 'var(--nova-blue)' : 'var(--nova-surface)',
              color: unitType === t ? '#fff' : 'var(--nova-text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'capitalize',
              border: '1px solid var(--nova-border)',
              whiteSpace: 'nowrap',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Input / Converter Box */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 10,
          alignItems: 'center',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          padding: 14,
        }}
      >
        {/* From Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setInteracting(true)}
            onBlur={() => setInteracting(false)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-input)',
              padding: '8px 10px',
              fontSize: '16px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'var(--nova-text-primary)',
              width: '100%',
            }}
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--nova-border)',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: '11px',
              color: 'var(--nova-text-secondary)',
              textTransform: 'capitalize',
            }}
          >
            {unitsConfig[unitType].units.map((u) => (
              <option key={u} value={u} style={{ background: '#141720' }}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          onClick={swapUnits}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'rgba(102, 136, 255, 0.15)',
            color: 'var(--nova-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Swap units"
        >
          <ArrowLeftRight size={14} />
        </button>

        {/* To Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-input)',
              padding: '8px 10px',
              fontSize: '16px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'var(--nova-cyan)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {formattedResult}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--nova-border)',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: '11px',
              color: 'var(--nova-text-secondary)',
              textTransform: 'capitalize',
            }}
          >
            {unitsConfig[unitType].units.map((u) => (
              <option key={u} value={u} style={{ background: '#141720' }}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Copy Result Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-input)',
          fontSize: '12px',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--nova-text-primary)' }}>
          {inputValue} {fromUnit} = <span style={{ color: 'var(--nova-cyan)', fontWeight: 600 }}>{formattedResult} {toUnit}</span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: 'var(--nova-blue)',
            color: '#fff',
            borderRadius: 4,
            fontSize: '11px',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};
