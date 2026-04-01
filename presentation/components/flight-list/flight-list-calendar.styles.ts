import type React from 'react';

export const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  background: '#ffffff',
  border: '1px solid #d9d9d9',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  padding: '12px 12px 16px',
  width: 260,
  userSelect: 'none',
};

export const calHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 10,
};

export const monthLabelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: '600',
  color: '#303030',
};

export const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 20,
  color: '#2c31c9',
  lineHeight: 1,
  padding: '0 6px',
  borderRadius: 4,
};

export const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 2,
};

export const dayHeaderStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: 11,
  fontWeight: '600',
  color: '#888',
  paddingBottom: 6,
};

export const dayCellStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 32,
  fontSize: 13,
  border: 'none',
  transition: 'background 120ms',
};
