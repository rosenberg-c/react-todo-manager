import styled from 'styled-components';

export const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  color: #213547;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  margin: 0;
  color: #213547;
`;

export const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #213547;
`;

export const UserInfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    font-size: 0.9rem;
    color: #666;
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
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
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
  color: #213547;
`;

export const UserDetail = styled.span`
  font-size: 0.875rem;
  color: #666;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
`;
