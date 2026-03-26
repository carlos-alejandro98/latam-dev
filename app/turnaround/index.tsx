import { IS_WEB } from '@/config/platform';
import { AuthGuard } from '@/presentation/guards/auth-guard';
import { useResponsive } from '@/presentation/hooks/use-responsive';
import { ControllerTurnaroundView } from '@/presentation/screens/turnaround/controller-turnaround-view';
import { MobileTurnaroundView } from '@/presentation/screens/turnaround/mobile-turnaround-view';
import { TabletTurnaroundView } from '@/presentation/screens/turnaround/tablet-turnaround-view';

/**
 * Turnaround root route.
 * Protects navigation and decides which view to render by platform/device type.
 */
export default function TurnaroundRoute() {
  const { isTablet } = useResponsive();

  const resolvedView = IS_WEB ? (
    <ControllerTurnaroundView />
  ) : isTablet ? (
    <TabletTurnaroundView />
  ) : (
    <MobileTurnaroundView />
  );

  return <AuthGuard>{resolvedView}</AuthGuard>;
}
