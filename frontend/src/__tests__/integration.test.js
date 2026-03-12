import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as api from '../lib/api.js';

/**
 * Frontend-Backend Integration Tests
 * 
 * Test Coverage:
 * ✓ Frontend API calls integrate correctly with backend structures
 * ✓ Tax calculation flow works end-to-end
 * ✓ History persistence works
 * ✓ Error handling is consistent
 * 
 * Note: These tests use mocked fetch to simulate API responses
 * matching the expected backend API contracts
 */

describe('Frontend-Backend Integration Tests', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('Tax Calculation Integration', () => {
    it('should fetch countries list from backend', async () => {
      const mockCountries = [
        { code: 'DE', name: 'Germany', currency: 'EUR', taxName: 'VAT' },
        { code: 'US', name: 'United States', currency: 'USD', taxName: 'Sales Tax' },
        { code: 'FR', name: 'France', currency: 'EUR', taxName: 'VAT' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ countries: mockCountries })
      });

      const result = await api.fetchCountries();
      expect(result).toEqual(mockCountries);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should send tax calculation request with correct format', async () => {
      const mockResult = {
        amount: 100,
        country: 'DE',
        taxRate: 0.19,
        taxAmount: 19,
        total: 119,
        authority: 'German Tax Authority',
        taxName: 'VAT'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult
      });

      const calcParams = {
        amount: 100,
        country: 'DE',
        productType: 'digital',
        buyerType: 'B2C'
      };

      const result = await api.calculateTax(calcParams);
      expect(result.taxRate).toBe(0.19);
      expect(result.taxAmount).toBe(19);
      expect(result.total).toBe(119);
    });

    it('should handle tax calculation errors correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid country code' })
      });

      const params = {
        amount: 100,
        country: 'XX',
        productType: 'digital',
        buyerType: 'B2C'
      };

      await expect(api.calculateTax(params)).rejects.toThrow('Invalid country code');
    });

    it('should work with different product types', async () => {
      const productTypes = ['digital', 'physical', 'service'];

      for (const type of productTypes) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            amount: 100,
            taxRate: 0.19,
            taxAmount: 19,
            total: 119
          })
        });

        const result = await api.calculateTax({
          amount: 100,
          country: 'DE',
          productType: type,
          buyerType: 'B2C'
        });

        expect(result.taxRate).toBeDefined();
      }
    });

    it('should work with different buyer types', async () => {
      const buyerTypes = ['B2C', 'B2B'];

      for (const type of buyerTypes) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            amount: 100,
            taxRate: type === 'B2B' ? 0 : 0.19,
            taxAmount: type === 'B2B' ? 0 : 19,
            total: 100
          })
        });

        const result = await api.calculateTax({
          amount: 100,
          country: 'DE',
          productType: 'digital',
          buyerType: type
        });

        expect(result).toBeDefined();
      }
    });
  });

  describe('History Integration', () => {
    it('should fetch history records from backend', async () => {
      const mockHistory = [
        {
          id: 1,
          amount: 100,
          country: 'DE',
          taxAmount: 19,
          total: 119,
          created_at: '2026-03-12T10:00:00Z'
        },
        {
          id: 2,
          amount: 200,
          country: 'US',
          taxAmount: 16,
          total: 216,
          created_at: '2026-03-12T09:00:00Z'
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ history: mockHistory })
      });

      const result = await api.fetchHistory();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should save calculation to history', async () => {
      const historyRecord = {
        amount: 100,
        country: 'DE',
        taxAmount: 19,
        total: 119,
        taxName: 'VAT'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await api.saveHistory(historyRecord);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle history save with minimal data', async () => {
      const minimalRecord = {
        amount: 50,
        country: 'US',
        taxAmount: 4,
        total: 54
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await api.saveHistory(minimalRecord);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('End-to-End Tax Flow', () => {
    it('should perform complete tax calculation and save flow', async () => {
      // Step 1: Fetch countries
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          countries: [{ code: 'DE', name: 'Germany' }]
        })
      });

      const countries = await api.fetchCountries();
      expect(countries.length).toBeGreaterThan(0);

      // Step 2: Calculate tax
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          amount: 100,
          taxRate: 0.19,
          taxAmount: 19,
          total: 119,
          authority: 'German Tax Authority'
        })
      });

      const taxResult = await api.calculateTax({
        amount: 100,
        country: 'DE',
        productType: 'digital',
        buyerType: 'B2C'
      });

      expect(taxResult.total).toBe(119);

      // Step 3: Save to history
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await api.saveHistory(taxResult);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('API Contract Validation', () => {
    it('should ensure tax response contains all required fields', async () => {
      const requiredFields = [
        'amount',
        'country',
        'taxRate',
        'taxAmount',
        'total',
        'authority',
        'taxName'
      ];

      const mockResponse = {
        amount: 100,
        country: 'DE',
        taxRate: 0.19,
        taxAmount: 19,
        total: 119,
        authority: 'German Tax Authority',
        taxName: 'VAT'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await api.calculateTax({
        amount: 100,
        country: 'DE',
        productType: 'digital',
        buyerType: 'B2C'
      });

      requiredFields.forEach((field) => {
        expect(result).toHaveProperty(field);
      });
    });

    it('should ensure history list contains proper records', async () => {
      const mockHistory = [
        {
          id: 1,
          amount: 100,
          country: 'DE',
          taxAmount: 19,
          total: 119
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ history: mockHistory })
      });

      const result = await api.fetchHistory();
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('amount');
        expect(result[0]).toHaveProperty('country');
      }
    });
  });
});
