import styled from 'styled-components';
import { colors } from '../../colors';

export const ButtonSecondary = styled.button`
  padding: 8px 16px;
  border: 1px solid ${colors.borderSecondary};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${colors.backgroundSecondary};
  color: ${colors.textPrimary};

  &:hover:not(:disabled) {
    background: ${colors.backgroundSecondaryHover};
    border-color: ${colors.borderSecondaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
