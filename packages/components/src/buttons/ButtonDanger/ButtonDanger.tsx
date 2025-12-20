import styled from 'styled-components';
import { colors } from '../../colors';

export const ButtonDanger = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${colors.danger};
  color: ${colors.background};

  &:hover:not(:disabled) {
    background: ${colors.dangerHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
