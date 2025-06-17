import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useSearchConfigs from '../../hooks/useSearchConfigs';

jest.mock('notistack', () => ({
    useSnackbar: () => ({
        enqueueSnackbar: jest.fn(),
    }),
}));

describe('useSearchConfigs Hook', () => {
    it('renders without crashing and has correct initial values', () => {
        const { result } = renderHook(() =>
            useSearchConfigs({ page: 0, pageSize: 10 }, [], { items: [] })
        );

        expect(result.current.searchConfigs).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
        expect(result.current.rowCount).toBe(0);
    });
});
