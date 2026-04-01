const VIEWER_ROLE = 'viewer';

export const VIEWER_TASK_ACTION_RESTRICTION_MESSAGE =
  'El perfil Viewer no puede iniciar, finalizar ni editar tareas.';

export const VIEWER_COMMENT_RESTRICTION_MESSAGE =
  'El perfil Viewer no puede realizar comentarios.';

export const isViewerRole = (role?: string | null): boolean => {
  return role?.trim().toLowerCase() === VIEWER_ROLE;
};

export const canManageFlightTaskActions = (role?: string | null): boolean => {
  return !isViewerRole(role);
};

export const canCreateFlightTaskComments = (role?: string | null): boolean => {
  return !isViewerRole(role);
};
