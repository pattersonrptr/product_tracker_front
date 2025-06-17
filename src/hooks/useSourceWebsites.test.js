import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useSourceWebsites from './useSourceWebsites';

jest.mock('notistack', () => ({
    useSnackbar: () => ({
        enqueueSnackbar: jest.fn(),
    }),
}));

describe('useSourceWebsites Hook', () => {
    it('renders without crashing and has correct initial values', () => {
        const { result } = renderHook(() =>
            useSourceWebsites({ page: 0, pageSize: 10 }, [], { items: [] })
        );

        expect(result.current.sourceWebsites).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
        expect(result.current.rowCount).toBe(0);
    });
});
