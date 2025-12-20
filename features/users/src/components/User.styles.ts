import styled from 'styled-components';
import { colors } from '@repo-pak/styles';

export const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  color: ${colors.textDark};
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${colors.textLight};
`;

export const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: ${colors.textDark};
`;

export const UserInfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    font-size: 0.9rem;
    color: ${colors.textSecondary};
  }
`;

export const FormsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Section = styled.section`
  background: ${colors.background};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  box-shadow: 0 1px 3px ${colors.shadow};
`;

export const UsersSection = styled(Section)`
  margin-bottom: 2rem;
`;

export const UserList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const UserItem = styled.li`
  padding: 1rem;
  background: ${colors.backgroundMuted};
  border: 1px solid ${colors.border};
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const UserUsername = styled.strong`
  font-size: 1.1rem;
  color: ${colors.textDark};
`;

export const UserDetail = styled.span`
  font-size: 0.875rem;
  color: ${colors.textSecondary};
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
`;
