import { getAdjustedValue } from './utils';

describe('getAdjustedValue', () => {
  describe('multiply', () => {
    it('properly handles 0.0000001 ETH => 100 GWEI', () => {
      expect(getAdjustedValue('0.0000001', true, 'multiply')).toEqual('100');
    });

    it('properly handles 0.00000005 ETH => 50 GWEI', () => {
      expect(getAdjustedValue('0.00000005', true, 'multiply')).toEqual('50');
    });

    it('properly handles 0.00000003 ETH => 30 GWEI', () => {
      expect(getAdjustedValue('0.00000003', true, 'multiply')).toEqual('30');
    });
  });

  describe('divide', () => {
    it('properly handles 100 GWEI => 0.0000001 ETH', () => {
      expect(getAdjustedValue('100', true, 'divide')).toEqual('0.0000001');
    });

    it('properly handles 50 GWEI => 0.00000005 ETH', () => {
      expect(getAdjustedValue('50', true, 'divide')).toEqual('0.00000005');
    });

    it('properly handles 30 GWEI => 0.00000003 ETH', () => {
      expect(getAdjustedValue('30', true, 'divide')).toEqual('0.00000003');
    });
  });
});
