import styled from 'styled-components';
import { colors } from '../../colors';

export const ErrorBanner = styled.div`
  background: ${colors.dangerBackground};
  border: 1px solid ${colors.dangerBorder};
  color: ${colors.dangerText};
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
`;
