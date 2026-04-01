import { describe, expect, it } from '@jest/globals';

import {
  canCreateFlightTaskComments,
  canManageFlightTaskActions,
  isViewerRole,
} from './flight-task-permissions';

describe('flight-task-permissions', () => {
  it('blocks task actions and comments for viewers', () => {
    expect(isViewerRole('viewer')).toBe(true);
    expect(canManageFlightTaskActions('viewer')).toBe(false);
    expect(canCreateFlightTaskComments('viewer')).toBe(false);
  });

  it('allows task actions and comments for non-viewer roles and unknown roles', () => {
    expect(canManageFlightTaskActions('controller')).toBe(true);
    expect(canCreateFlightTaskComments('admin')).toBe(true);
    expect(canManageFlightTaskActions(null)).toBe(true);
  });
});
