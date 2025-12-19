import styled from 'styled-components';

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
  color: rgba(255, 255, 255, 0.87);
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
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
  background: ${(props) => (props.$isDragOver ? '#f0f0f0' : '#f8f9fa')};
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
  border-bottom: 2px solid #e0e0e0;
`;

export const ColumnTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

export const ColumnCount = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  background: #fff;
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
  background: white;
  border-radius: 6px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transition: all 0.2s ease;
  opacity: ${(props) => (props.$isDragging ? '0.5' : '1')};

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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
  color: #1a1a1a;
  flex: 1;
  word-break: break-word;
`;

export const CardDescription = styled.p`
  font-size: 13px;
  color: #666;
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
  border-top: 1px solid #f0f0f0;
`;

export const CardDate = styled.span`
  font-size: 11px;
  color: #999;
`;

export const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #ffe0e0;
  }
`;

export const AddForm = styled.form`
  background: white;
  border-radius: 6px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    props.$variant === 'primary' ? '#4a90e2' : '#e0e0e0'};
  color: ${(props) => (props.$variant === 'primary' ? 'white' : '#333')};

  &:hover {
    background: ${(props) =>
      props.$variant === 'primary' ? '#357abd' : '#d0d0d0'};
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
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #333;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
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
  color: #999;

  &:hover {
    color: #333;
  }
`;

export const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SortLabel = styled.label`
  font-size: 14px;
  color: #666;
  white-space: nowrap;
`;

export const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background: white;
  color: #333;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }

  option {
    color: #333;
  }
`;

export const AddListButton = styled.button`
  min-width: 280px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.05);
  border: 2px dashed #ccc;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    border-color: #999;
  }
`;

export const AddListForm = styled.form`
  min-width: 280px;
  background: #f8f9fa;
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
  color: red;
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
