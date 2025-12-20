import styled from 'styled-components';
import { colors } from '../../colors';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: ${colors.textPrimary};
`;
