import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useProductDetails from '../../hooks/useProductDetails';

jest.mock('notistack', () => ({
    useSnackbar: () => ({
        enqueueSnackbar: jest.fn(),
    }),
}));

describe('useProductDetails', () => {
    it('renders without crashing and has correct initial values', () => {
        const { result } = renderHook(() => useProductDetails('1'));
        expect(result.current.product).toBe(null);
        expect(result.current.priceHistory).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
    });
});
