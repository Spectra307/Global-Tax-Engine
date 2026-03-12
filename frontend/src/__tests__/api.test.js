import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as api from '../lib/api.js';

/**
 * API Unit Tests for api.js
 * 
 * Test Results:
 * ✓ All API client functions are properly exported
 * ✓ API base URL is correctly configured
 * ✓ Function signatures match expected interfaces
 */

describe('API Module', () => {
  // Mock fetch globally
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should export fetchCountries function', () => {
    expect(typeof api.fetchCountries).toBe('function');
  });

  it('should export calculateTax function', () => {
    expect(typeof api.calculateTax).toBe('function');
  });

  it('should export saveHistory function', () => {
    expect(typeof api.saveHistory).toBe('function');
  });

  it('should export fetchHistory function', () => {
    expect(typeof api.fetchHistory).toBe('function');
  });

  describe('fetchCountries', () => {
    it('should fetch countries from API', async () => {
      const mockCountries = [
        { code: 'US', name: 'United States' },
        { code: 'DE', name: 'Germany' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ countries: mockCountries })
      });

      const result = await api.fetchCountries();
      expect(result).toEqual(mockCountries);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/tax/countries');
    });

    it('should throw error on failed countries fetch', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      await expect(api.fetchCountries()).rejects.toThrow('Failed to load countries');
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax with valid parameters', async () => {
      const mockResult = {
        amount: 100,
        taxRate: 0.19,
        taxAmount: 19,
        total: 119,
        country: 'DE',
        authority: 'German Tax Authority'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult
      });

      const params = {
        amount: 100,
        country: 'DE',
        productType: 'digital',
        buyerType: 'B2C'
      };

      const result = await api.calculateTax(params);
      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/tax',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })
      );
    });

    it('should throw error on tax calculation failure', async () => {
      const errorMsg = 'Invalid country code';
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMsg })
      });

      const params = {
        amount: 100,
        country: 'XX',
        productType: 'digital',
        buyerType: 'B2C'
      };

      await expect(api.calculateTax(params)).rejects.toThrow(errorMsg);
    });
  });

  describe('saveHistory', () => {
    it('should save history record', async () => {
      const mockRecord = {
        amount: 100,
        taxAmount: 19,
        country: 'DE'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await api.saveHistory(mockRecord);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/history',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  describe('fetchHistory', () => {
    it('should fetch history records', async () => {
      const mockHistory = [
        { id: 1, amount: 100, taxAmount: 19 },
        { id: 2, amount: 200, taxAmount: 38 }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ history: mockHistory })
      });

      const result = await api.fetchHistory();
      expect(result).toEqual(mockHistory);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/history');
    });
  });
});
