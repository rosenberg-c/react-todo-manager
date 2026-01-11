package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sync"
)

type JSONStore struct {
	path string
	mu   sync.RWMutex
}

// NewJSONStore creates a new JSONStore that persists data to the specified file path.
func NewJSONStore(path string) *JSONStore {
	return &JSONStore{path: path}
}

// Load reads JSON data from the file and unmarshals it into the provided value.
// Returns nil if the file does not exist or is empty.
func (store *JSONStore) Load(ctx context.Context, value interface{}) error {
	store.mu.RLock()
	defer store.mu.RUnlock()

	data, err := os.ReadFile(store.path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("could not read file %s: %w", store.path, err)
	}

	if len(data) == 0 {
		return nil
	}

	if err := json.Unmarshal(data, value); err != nil {
		return fmt.Errorf("could not unmarshal json: %w", err)
	}
	return nil
}

// Save marshals the provided value to JSON and writes it to the file.
// Uses fsync to ensure data is flushed to disk before returning.
func (store *JSONStore) Save(ctx context.Context, value interface{}) error {
	store.mu.Lock()
	defer store.mu.Unlock()

	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return fmt.Errorf("could not marshal json: %w", err)
	}

	file, err := os.Create(store.path)
	if err != nil {
		return fmt.Errorf("could not create file %s: %w", store.path, err)
	}
	defer file.Close()

	if _, err := file.Write(data); err != nil {
		return fmt.Errorf("could not write file %s: %w", store.path, err)
	}

	if err := file.Sync(); err != nil {
		return fmt.Errorf("could not sync file %s: %w", store.path, err)
	}

	return nil
}
