import type { ComponentPropsWithoutRef } from 'react';

import { defaultStyles } from './styles';

export type ButtonPrimaryProps = ComponentPropsWithoutRef<'button'>;

export const ButtonPrimary = ({
  children,
  style,
  ...props
}: ButtonPrimaryProps) => {
  const styles = {
    ...defaultStyles.button,
    ...style,
  };

  return (
    <button style={styles} {...props}>
      {children}
    </button>
  );
};
