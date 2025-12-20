import styled from 'styled-components';
import { colors } from '@repo-pak/styles';

export const FormError = styled.div`
  background-color: ${colors.dangerBackground};
  color: ${colors.dangerText};
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
`;
