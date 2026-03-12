import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';

/**
 * Backend Integration Tests - Tax API
 * 
 * Test Coverage:
 * ✓ GET /api/health - Health check endpoint
 * ✓ GET /api/tax/countries - Fetch supported countries
 * ✓ POST /api/tax - Calculate tax with valid parameters
 * ✓ POST /api/tax - Reject invalid parameters
 * ✓ POST /api/tax - Handle missing fields
 */

describe('Tax API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/tax/countries', () => {
    it('should return list of supported countries', async () => {
      const response = await request(app)
        .get('/api/tax/countries')
        .expect(200);

      expect(response.body).toHaveProperty('countries');
      expect(Array.isArray(response.body.countries)).toBe(true);
      expect(response.body.countries.length).toBeGreaterThan(0);
    });

    it('should have required country fields', async () => {
      const response = await request(app)
        .get('/api/tax/countries')
        .expect(200);

      const country = response.body.countries[0];
      expect(country).toHaveProperty('code');
      expect(country).toHaveProperty('name');
      expect(country).toHaveProperty('currency');
      expect(country).toHaveProperty('taxName');
    });
  });

  describe('POST /api/tax', () => {
    const validPayload = {
      amount: 100,
      country: 'DE',
      productType: 'digital',
      buyerType: 'B2C'
    };

    it('should calculate tax with valid parameters', async () => {
      const response = await request(app)
        .post('/api/tax')
        .send(validPayload)
        .expect(200);

      expect(response.body).toHaveProperty('taxRate');
      expect(response.body).toHaveProperty('taxAmount');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('authority');
      expect(response.body).toHaveProperty('taxName');
    });

    it('should correctly calculate tax amount', async () => {
      const response = await request(app)
        .post('/api/tax')
        .send(validPayload)
        .expect(200);

      const expectedTax = validPayload.amount * response.body.taxRate;
      expect(Math.abs(response.body.taxAmount - expectedTax)).toBeLessThan(0.01);
      expect(response.body.total).toBe(validPayload.amount + response.body.taxAmount);
    });

    it('should reject request with missing amount', async () => {
      const payload = { ...validPayload };
      delete payload.amount;

      const response = await request(app)
        .post('/api/tax')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required fields');
    });

    it('should reject request with missing country', async () => {
      const payload = { ...validPayload };
      delete payload.country;

      const response = await request(app)
        .post('/api/tax')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with missing productType', async () => {
      const payload = { ...validPayload };
      delete payload.productType;

      const response = await request(app)
        .post('/api/tax')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with missing buyerType', async () => {
      const payload = { ...validPayload };
      delete payload.buyerType;

      const response = await request(app)
        .post('/api/tax')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid country code gracefully', async () => {
      const payload = { ...validPayload, country: 'XX' };

      const response = await request(app)
        .post('/api/tax')
        .send(payload);

      // Should either return 400 or return a consistent result
      expect([200, 400]).toContain(response.status);
    });

    it('should work with multiple buyer types', async () => {
      const buyerTypes = ['B2C', 'B2B'];

      for (const type of buyerTypes) {
        const response = await request(app)
          .post('/api/tax')
          .send({ ...validPayload, buyerType: type })
          .expect(200);

        expect(response.body).toHaveProperty('taxRate');
      }
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Endpoint not found');
    });
  });
});
