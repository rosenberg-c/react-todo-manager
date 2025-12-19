import { type CSSProperties } from 'react';

type StyleKeys = 'button';

export type Styles = Record<StyleKeys, CSSProperties>;

export const defaultStyles: Styles = {
  button: {
    // border: '1px solid rgba(255, 255, 255, 0.3)',
    // borderRadius: '4px',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // color: '#fff',
    // cursor: 'pointer',
    // display: 'flex' as const,
    // alignItems: 'center',
    // justifyContent: 'center',
    // fontSize: '16px',
    // fontWeight: 'bold',
    // transition: 'all 0.2s ease',
  },
} as const;
