import styled from 'styled-components';

export const ButtonSecondary = styled.button`
  padding: 8px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
  color: #333;

  &:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #adb5bd;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
