import styled from 'styled-components';
import { colors } from '@repo-pak/styles';

export const ButtonSecondary = styled.button`
  padding: 8px 16px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${colors.backgroundMuted};
  color: ${colors.textPrimary};

  &:hover:not(:disabled) {
    background: ${colors.backgroundHover};
    border-color: ${colors.borderHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
