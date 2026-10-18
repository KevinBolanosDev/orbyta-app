import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// TODO(F1): reemplazar por los componentes Cristal Aurora de @repo/ui (design-system.md §7).
// Son simples a propósito: F0 solo prueba el cableado entre capas.

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}

export function Body({ children, testID }: { children: ReactNode; testID?: string }) {
  return (
    <Text style={styles.body} testID={testID}>
      {children}
    </Text>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} inputMode="decimal" style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16, borderWidth: 1, borderColor: '#8884', padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  field: { gap: 4 },
  label: { fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#8886', borderRadius: 8, padding: 8, minHeight: 44 },
});
