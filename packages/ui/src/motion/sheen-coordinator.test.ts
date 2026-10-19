import { createSheenCoordinator } from './sheen-coordinator';

describe('sheen coordinator', () => {
  it('gives the idle sheen to the first surface and passes it on unmount', () => {
    const coordinator = createSheenCoordinator();
    expect(coordinator.owner()).toBeUndefined();

    const releaseA = coordinator.register('a');
    const releaseB = coordinator.register('b');
    expect(coordinator.owner()).toBe('a');

    releaseA();
    expect(coordinator.owner()).toBe('b');
    releaseB();
    expect(coordinator.owner()).toBeUndefined();
  });

  it('notifies subscribers until they unsubscribe', () => {
    const coordinator = createSheenCoordinator();
    const listener = jest.fn();
    const unsubscribe = coordinator.subscribe(listener);

    const release = coordinator.register('a');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    release();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
