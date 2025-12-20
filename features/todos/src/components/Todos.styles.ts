import styled from 'styled-components';

const colors = {
  textPrimary: '#333',
  textSecondary: '#666',
  textMuted: '#999',
  textLight: 'rgba(255, 255, 255, 0.87)',
  textDark: '#1a1a1a',

  background: 'white',
  backgroundMuted: '#f8f9fa',
  backgroundHover: '#f0f0f0',
  backgroundOverlay: 'rgba(0, 0, 0, 0.05)',
  backgroundOverlayHover: 'rgba(0, 0, 0, 0.08)',

  border: '#e0e0e0',
  borderLight: '#ddd',
  borderMuted: '#ccc',
  borderDivider: '#f0f0f0',

  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowHover: 'rgba(0, 0, 0, 0.15)',

  primary: '#4a90e2',
  primaryHover: '#357abd',
  secondary: '#e0e0e0',
  secondaryHover: '#d0d0d0',

  danger: '#dc3545',
  dangerBackground: '#ffe0e0',
};

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

export const Header = styled.div`
  margin-bottom: 30px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: ${colors.textLight};
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0;
`;

export const BoardContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
`;

export const Column = styled.div<{ $isDragOver?: boolean }>`
  flex: 1;
  min-width: 320px;
  background: ${(props) =>
    props.$isDragOver ? colors.backgroundHover : colors.backgroundMuted};
  border-radius: 8px;
  padding: 16px;
  transition: background-color 0.2s ease;
`;

export const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${colors.border};
`;

export const ColumnTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: ${colors.textPrimary};
`;

export const ColumnCount = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textSecondary};
  background: ${colors.background};
  padding: 4px 10px;
  border-radius: 12px;
`;

export const TodoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100px;
`;

export const Card = styled.div<{ $isDragging?: boolean }>`
  background: ${colors.background};
  border-radius: 6px;
  padding: 14px;
  box-shadow: 0 1px 3px ${colors.shadow};
  cursor: grab;
  transition: all 0.2s ease;
  opacity: ${(props) => (props.$isDragging ? '0.5' : '1')};

  &:hover {
    box-shadow: 0 2px 6px ${colors.shadowHover};
    transform: translateY(-2px);
  }

  &:active {
    cursor: grabbing;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

export const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: ${colors.textDark};
  flex: 1;
  word-break: break-word;
`;

export const CardDescription = styled.p`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin: 0 0 12px 0;
  line-height: 1.4;
  word-break: break-word;
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${colors.borderDivider};
`;

export const CardDate = styled.span`
  font-size: 11px;
  color: ${colors.textMuted};
`;

export const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: ${colors.danger};
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${colors.dangerBackground};
  }
`;

export const AddForm = styled.form`
  background: ${colors.background};
  border-radius: 6px;
  padding: 14px;
  box-shadow: 0 1px 3px ${colors.shadow};
  margin-bottom: 12px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$variant === 'primary' ? colors.primary : colors.secondary};
  color: ${(props) =>
    props.$variant === 'primary' ? colors.background : colors.textPrimary};

  &:hover {
    background: ${(props) =>
      props.$variant === 'primary'
        ? colors.primaryHover
        : colors.secondaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Controls = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

export const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  max-width: 100%;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 40px;
  border: 1px solid ${colors.borderLight};
  border-radius: 6px;
  font-size: 14px;
  background: ${colors.background};
  color: ${colors.textPrimary};

  &::placeholder {
    color: ${colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

export const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  pointer-events: none;
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${colors.textMuted};

  &:hover {
    color: ${colors.textPrimary};
  }
`;

export const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SortLabel = styled.label`
  font-size: 14px;
  color: ${colors.textSecondary};
  white-space: nowrap;
`;

export const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${colors.borderLight};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: ${colors.background};
  color: ${colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }

  option {
    color: ${colors.textPrimary};
  }
`;

export const AddListButton = styled.button`
  min-width: 280px;
  padding: 16px;
  background: ${colors.backgroundOverlay};
  border: 2px dashed ${colors.borderMuted};
  border-radius: 8px;
  color: ${colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.backgroundOverlayHover};
    border-color: ${colors.textMuted};
  }
`;

export const AddListForm = styled.form`
  min-width: 280px;
  background: ${colors.backgroundMuted};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  transition: all 0.2s ease;
  opacity: 0.7;
  color: ${colors.danger};
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

export const ColumnActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
