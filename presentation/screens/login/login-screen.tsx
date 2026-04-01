import React, { useMemo } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

import { IS_WEB } from '@/config/platform';
import { container } from '@/dependencyInjection/container';
import { applyAuthSessionToHttpClient } from '@/infrastructure/api/axios-client';
import { Text } from '@/presentation/components/design-system';
import { useAuthController } from '@/presentation/controllers/use-auth-controller';
import type { AppDispatch } from '@/store';
import { setRole, setSession } from '@/store/slices/auth-slice';

// TODO: Remove this flag when Azure AD is configured as Single-Page Application
const ENABLE_DEV_SKIP_LOGIN = true;

const LATAM_RED = '#D51146';
const CARD_BORDER_TOP = '#0D12AB';
const OVERLAY_COLOR = 'rgba(13, 18, 171, 0.35)';

/**
 * OAuth login screen matching Figma design.
 * Full-screen background with centered card, LATAM branding and Azure AD login.
 * Includes role selection (Controller/Operator) for user preference.
 */
export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading, login } = useAuthController();

  // Read ?error= param from URL (web only) to show specific messages after redirects.
  const urlError = useMemo<string | null>(() => {
    if (!IS_WEB || typeof window.location?.search !== 'string') {
      return null;
    }

    const param = new URLSearchParams(window.location.search).get('error');
    if (param === 'no_permissions') {
      return 'No tienes permisos para acceder a esta aplicacion. Contacta con tu administrador.';
    }
    return null;
  }, []);

  // TODO: Remove when Azure AD is configured as Single-Page Application
  const handleDevSkipLogin = async () => {
    // Create a valid mock JWT with exp claim for validation
    // Format: header.payload.signature (validator only decodes payload)
    const expiresAt = Math.floor(Date.now() / 1000) + 8 * 60 * 60; // 8 hours from now
    const mockPayload = {
      exp: expiresAt,
      oid: 'dev-mock-oid',
      email: 'dev@compass.local',
      name: 'Dev User',
      roles: ['controller'],
    };

    // Create mock JWT (header.payload.signature format)
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(mockPayload));
    const mockJWT = `${header}.${payload}.mock-signature`;

    const mockSession = {
      accessToken: mockJWT,
      idToken: mockJWT,
      refreshToken: 'dev-mock-refresh-token',
      expiresAt: expiresAt * 1000, // Convert to milliseconds
    };

    // Save to persistent storage so AuthGuard doesn't clear it
    await container.tokenStorage.save(mockSession);

    // Set in Redux state
    dispatch(setSession(mockSession));
    dispatch(setRole('controller'));

    // Apply to HTTP client
    applyAuthSessionToHttpClient(mockSession);

    // Navigate to turnaround
    router.replace('/turnaround');
  };

  return (
    <ImageBackground
      source={require('@/presentation/assets/images/login-background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Blue overlay */}
      <View style={styles.overlay} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Login Card */}
        <View style={styles.card}>
          {/* Logo placeholder */}
          <View style={styles.logoContainer}>
            <Text variant="body-md" style={styles.logoPlaceholder}>
              Logo Compass
            </Text>
          </View>

          {/* Title */}
          <Text variant="heading-lg" style={styles.title}>
            Bem-vindo à Compass
          </Text>

          {/* Description */}
          <Text variant="body-md" style={styles.description}>
            Acesse a ferramenta de gerenciamento de Turnaround
          </Text>

          <Text variant="body-md" style={styles.description}>
            Use suas credenciais da LATAM para fazer login.
          </Text>

          {/* No-permissions error from redirect */}
          {urlError ? (
            <View style={styles.permissionsErrorBox}>
              <Text variant="body-sm" style={styles.permissionsErrorText}>
                {urlError}
              </Text>
            </View>
          ) : null}

          {/* Auth error message */}
          {error ? (
            <Text variant="body-sm" style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          {/* Login button */}
          <Pressable
            disabled={loading}
            onPress={() => {
              void login();
            }}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
              loading && styles.loginButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Login com sua conta LATAM"
          >
            {loading ? (
              <Text variant="label-md" style={styles.loginButtonText}>
                Carregando...
              </Text>
            ) : (
              <Text variant="label-md" style={styles.loginButtonText}>
                Login com sua conta LATAM.
              </Text>
            )}
          </Pressable>

          {/* Temporary Dev Skip Button - Remove when Azure AD is configured */}
          {ENABLE_DEV_SKIP_LOGIN && (
            <Pressable
              onPress={() => {
                void handleDevSkipLogin();
              }}
              style={({ pressed }) => [
                styles.devSkipButton,
                pressed && styles.devSkipButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Skip login for testing"
            >
              <Text variant="label-sm" style={styles.devSkipButtonText}>
                Saltar Login (Solo Pruebas)
              </Text>
            </Pressable>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.latamBranding}>
            <Image
              source={require('@/presentation/assets/images/latam-logo.jpg')}
              style={styles.latamLogo}
              accessibilityLabel="LATAM Airlines logo"
              resizeMode="contain"
            />
          </View>
          <Text variant="body-sm" style={styles.copyright}>
            © 2026 LATAM Airlines
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY_COLOR,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderTopWidth: 4,
    borderTopColor: CARD_BORDER_TOP,
    padding: 24,
    gap: 16,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    color: '#303030',
    textAlign: 'center',
  },
  title: {
    color: '#0A0A0A',
    fontWeight: '700',
  },
  description: {
    color: '#303030',
  },
  errorText: {
    color: '#D51146',
  },
  permissionsErrorBox: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  permissionsErrorText: {
    color: '#7A4F00',
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: LATAM_RED,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loginButtonPressed: {
    backgroundColor: '#AA0D38',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  devSkipButton: {
    backgroundColor: 'transparent',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#999999',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devSkipButtonPressed: {
    backgroundColor: '#F0F0F0',
  },
  devSkipButtonText: {
    color: '#666666',
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  latamBranding: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  latamLogo: {
    width: 160,
    height: 52,
  },
  copyright: {
    color: '#FFFFFF',
    opacity: 0.85,
  },
});
