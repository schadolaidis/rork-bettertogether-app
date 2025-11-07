import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface DebugErrorBoundaryProps {
  children: React.ReactNode;
}

interface DebugErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  errorStack?: string;
}

class DebugErrorBoundaryInner extends React.Component<DebugErrorBoundaryProps, DebugErrorBoundaryState> {
  constructor(props: DebugErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '', errorStack: undefined };
  }

  static getDerivedStateFromError(error: Error): DebugErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message ?? 'Unbekannter Fehler', errorStack: (error as any)?.stack };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', info?.componentStack);
  }

  reset = () => {
    console.log('[ErrorBoundary] Resetting error boundary');
    this.setState({ hasError: false, errorMessage: '', errorStack: undefined });
  };

  hardReload = () => {
    console.log('[ErrorBoundary] Performing hard reload');
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      // Fallback: navigate to root; avoids needing native updates package
      // Consumers can re-mount providers to recover
      // We cannot import useRouter here; use a simple event
      this.reset();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    return (
      <View style={styles.container} testID="debug-error-boundary">
        <Text style={styles.title}>Etwas ist schiefgelaufen</Text>
        <Text style={styles.subtitle}>Die App ist auf einen Fehler gestoßen. Du kannst neu laden oder zum Start zurückkehren.</Text>
        <View style={styles.card} testID="debug-error-details">
          <Text style={styles.label}>Fehlermeldung</Text>
          <Text selectable style={styles.mono}>{this.state.errorMessage}</Text>
          {this.state.errorStack ? (
            <>
              <Text style={[styles.label, { marginTop: 12 }]}>Stack</Text>
              <Text selectable style={[styles.mono, { maxHeight: 160 }]}>{this.state.errorStack}</Text>
            </>
          ) : null}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={this.reset} style={[styles.button, styles.secondary]} testID="btn-boundary-reset">
            <Text style={styles.buttonText}>Zurück</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.hardReload} style={[styles.button, styles.primary]} testID="btn-boundary-reload">
            <Text style={[styles.buttonText, styles.primaryText]}>Neu laden</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export function DebugErrorBoundary(props: DebugErrorBoundaryProps) {
  const router = useRouter();

  const onBackToRoot = () => {
    try {
      router.replace('/');
      console.log('[ErrorBoundary] Navigated to root');
    } catch (e) {
      console.error('[ErrorBoundary] Failed to navigate to root', e);
    }
  };

  return (
    <DebugErrorBoundaryInner>
      <View style={{ flex: 1 }}>
        {props.children}
      </View>
    </DebugErrorBoundaryInner>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0B0F14',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#E8F0FE',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#A9B4C0',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  mono: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: '#2563EB',
  },
  secondary: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#E5E7EB',
    fontWeight: '600' as const,
  },
  primaryText: {
    color: '#F9FAFB',
  },
});
