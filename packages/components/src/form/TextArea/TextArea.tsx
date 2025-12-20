import styled from 'styled-components';
import { colors } from '../../colors';

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
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
