process.env.ENCRYPTION_KEY = "a".repeat(64); // 32 bytes as hex for testing
process.env.JWT_SECRET = "test-jwt-secret-that-is-long-enough-for-hs256";
process.env.NEON_URL = "postgresql://test:test@localhost:5432/test";
process.env.CORS_ORIGIN = "http://localhost:5173";
process.env.FROM_EMAIL = "test@test.com";
process.env.RESEND_API_KEY = "re_test_key";
