import styled from 'styled-components';
import { colors } from '@repo-pak/styles';

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  background: ${colors.backgroundMuted};
  color: ${colors.textDark};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    background: ${colors.background};
    box-shadow: 0 0 0 2px ${colors.primaryFocusRing};
  }

  &::placeholder {
    color: ${colors.textMuted};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
