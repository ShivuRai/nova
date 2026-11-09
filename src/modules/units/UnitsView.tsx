import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

type UnitType = 'length' | 'weight' | 'temp' | 'data' | 'currency';

export const UnitsView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [unitType, setUnitType] = useState<UnitType>('length');
  const [inputValue, setInputValue] = useState<string>('100');
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('foot');
  const [copied, setCopied] = useState(false);

  const unitsConfig: Record<UnitType, { units: string[]; convert: (val: number, from: string, to: string) => number }> = {
    length: {
      units: ['meter', 'kilometer', 'centimeter', 'mile', 'foot', 'inch'],
      convert: (val, from, to) => {
        const inMeters: Record<string, number> = {
          meter: 1,
          kilometer: 1000,
          centimeter: 0.01,
          mile: 1609.34,
          foot: 0.3048,
          inch: 0.0254,
        };
        const meters = val * (inMeters[from] || 1);
        return meters / (inMeters[to] || 1);
      },
    },
    weight: {
      units: ['kilogram', 'gram', 'pound', 'ounce', 'ton'],
      convert: (val, from, to) => {
        const inGrams: Record<string, number> = {
          kilogram: 1000,
          gram: 1,
          pound: 453.592,
          ounce: 28.3495,
          ton: 1000000,
        };
        const grams = val * (inGrams[from] || 1);
        return grams / (inGrams[to] || 1);
      },
    },
    temp: {
      units: ['celsius', 'fahrenheit', 'kelvin'],
      convert: (val, from, to) => {
        let c = val;
        if (from === 'fahrenheit') c = (val - 32) * (5 / 9);
        else if (from === 'kelvin') c = val - 273.15;

        if (to === 'fahrenheit') return c * (9 / 5) + 32;
        if (to === 'kelvin') return c + 273.15;
        return c;
      },
    },
    data: {
      units: ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'],
      convert: (val, from, to) => {
        const inBytes: Record<string, number> = {
          byte: 1,
          kilobyte: 1024,
          megabyte: 1024 * 1024,
          gigabyte: 1024 * 1024 * 1024,
          terabyte: 1024 * 1024 * 1024 * 1024,
        };
        const b = val * (inBytes[from] || 1);
        return b / (inBytes[to] || 1);
      },
    },
    currency: {
      units: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'],
      convert: (val, from, to) => {
        const inUsd: Record<string, number> = {
          USD: 1,
          EUR: 1.08,
          GBP: 1.28,
          INR: 0.012,
          JPY: 0.0065,
          CAD: 0.72,
        };
        const usd = val * (inUsd[from] || 1);
        return usd / (inUsd[to] || 1);
      },
    },
  };

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
