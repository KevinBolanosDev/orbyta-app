import { renderHook, waitFor } from '@testing-library/react-native';

import { useSystemStatus } from './use-system-status';

describe('useSystemStatus', () => {
  it('starts as checking and ignores a failure that happens after unmount', async () => {
    let rejectRequest: (reason: Error) => void = () => undefined;
    globalThis.fetch = jest.fn(
      () =>
        new Promise<Response>((_resolve, reject) => {
          rejectRequest = reject;
        }),
    );

    const { result, unmount } = await renderHook(() => useSystemStatus());
    expect(result.current).toEqual({ kind: 'checking' });

    await unmount();
    rejectRequest(new Error('aborted'));

    await waitFor(() => {
      expect(result.current).toEqual({ kind: 'checking' });
    });
  });
});
