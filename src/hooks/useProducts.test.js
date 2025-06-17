import { renderHook } from '@testing-library/react-hooks';
import useProducts from './useProducts';
import { SnackbarProvider } from 'notistack';

jest.mock('notistack', () => ({
    useSnackbar: () => ({
        enqueueSnackbar: jest.fn(),
    }),
}));

describe('useProducts Hook', () => {
    it('renders without crashing', () => {
        const { result } = renderHook(() => useProducts({ page: 0, pageSize: 10 }, [], { items: [] }), {
            wrapper: ({ children }) => <SnackbarProvider>{children}</SnackbarProvider>,
        });
    });
});
