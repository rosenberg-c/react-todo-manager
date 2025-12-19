import styled from 'styled-components';

export const ButtonPrimary = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #4a90e2;
  color: white;

  &:hover:not(:disabled) {
    background: #357abd;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
