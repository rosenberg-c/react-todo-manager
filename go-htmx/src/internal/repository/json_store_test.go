package repository

import (
	"context"
	"os"
	"path/filepath"
	"testing"
)

func TestJSONStore_LoadSave(t *testing.T) {
	tmpDir := t.TempDir()

	tests := []struct {
		name     string
		input    []string
		expected []string
	}{
		{
			name:     "save and load slice",
			input:    []string{"one", "two", "three"},
			expected: []string{"one", "two", "three"},
		},
		{
			name:     "empty slice",
			input:    []string{},
			expected: []string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			path := filepath.Join(tmpDir, tt.name+".json")
			store := NewJSONStore(path)
			ctx := context.Background()

			if err := store.Save(ctx, tt.input); err != nil {
				t.Fatalf("Save() error = %v", err)
			}

			var result []string
			if err := store.Load(ctx, &result); err != nil {
				t.Fatalf("Load() error = %v", err)
			}

			if len(result) != len(tt.expected) {
				t.Errorf(
					"Load() got %d items, want %d",
					len(result),
					len(tt.expected),
				)
			}

			for i, value := range result {
				if value != tt.expected[i] {
					t.Errorf(
						"Load()[%d] = %v, want %v",
						i,
						value,
						tt.expected[i],
					)
				}
			}
		})
	}
}

func TestJSONStore_LoadNonExistent(t *testing.T) {
	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "nonexistent.json")
	store := NewJSONStore(path)
	ctx := context.Background()

	var result []string
	if err := store.Load(ctx, &result); err != nil {
		t.Errorf("Load() on non-existent file should not error, got %v", err)
	}

	if result != nil {
		t.Errorf(
			"Load() on non-existent file should return nil, got %v",
			result,
		)
	}
}

func TestJSONStore_LoadEmptyFile(t *testing.T) {
	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "empty.json")

	if err := os.WriteFile(path, []byte{}, 0644); err != nil {
		t.Fatalf("could not create empty file: %v", err)
	}

	store := NewJSONStore(path)
	ctx := context.Background()

	var result []string
	if err := store.Load(ctx, &result); err != nil {
		t.Errorf("Load() on empty file should not error, got %v", err)
	}
}

func TestJSONStore_LoadInvalidJSON(t *testing.T) {
	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "invalid.json")

	if err := os.WriteFile(path, []byte("not json"), 0644); err != nil {
		t.Fatalf("could not create file: %v", err)
	}

	store := NewJSONStore(path)
	ctx := context.Background()

	var result []string
	if err := store.Load(ctx, &result); err == nil {
		t.Error("Load() on invalid JSON should error")
	}
}
