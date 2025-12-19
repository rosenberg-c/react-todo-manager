import * as S from './Todos.styles';
import { MESSAGES } from './messages';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <S.SearchContainer>
      <S.SearchIcon>🔍</S.SearchIcon>
      <S.SearchInput
        type="text"
        placeholder={MESSAGES.PLACEHOLDER_SEARCH}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <S.ClearButton onClick={() => onChange('')} type="button">
          ×
        </S.ClearButton>
      )}
    </S.SearchContainer>
  );
};
