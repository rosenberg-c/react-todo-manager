package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Host       string
	Port       string
	DataPath   string
	SessionKey string
}

func Load() *Config {
	godotenv.Load()

	return &Config{
		Host:       getEnv("HOST", "0.0.0.0"),
		Port:       getEnv("PORT", "8080"),
		DataPath:   getEnv("DATA_PATH", "data"),
		SessionKey: getEnv("SESSION_KEY", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
