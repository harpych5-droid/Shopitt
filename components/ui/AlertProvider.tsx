/**
 * Shopitt — Custom AlertProvider
 * Replaces @/template AlertProvider with zero OnSpace Cloud dependency.
 */
import React, {
  createContext, useContext, useState, useCallback, ReactNode,
} from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet, Animated,
} from 'react-native';
import { Colors, Radius, Typography } from '@/constants/theme';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<AlertButton[]>([{ text: 'OK' }]);

  const showAlert = useCallback(
    (t: string, m?: string, btns?: AlertButton[]) => {
      setTitle(t);
      setMessage(m || '');
      setButtons(btns?.length ? btns : [{ text: 'OK' }]);
      setVisible(true);
    },
    [],
  );

  const dismiss = (btn: AlertButton) => {
    setVisible(false);
    btn.onPress?.();
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.box}>
            <Text style={styles.title}>{title}</Text>
            {!!message && <Text style={styles.message}>{message}</Text>}
            <View style={[styles.btnRow, buttons.length === 1 && { justifyContent: 'center' }]}>
              {buttons.map((btn, i) => (
                <Pressable
                  key={i}
                  onPress={() => dismiss(btn)}
                  style={({ pressed }) => [
                    styles.btn,
                    btn.style === 'cancel' && styles.btnCancel,
                    btn.style === 'destructive' && styles.btnDestructive,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.btnText,
                      btn.style === 'cancel' && styles.btnTextCancel,
                      btn.style === 'destructive' && styles.btnTextDestructive,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  box: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: Radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    color: '#fff',
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    backgroundColor: Colors.pink,
    borderRadius: Radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnDestructive: {
    backgroundColor: '#FF3B30',
  },
  btnText: {
    color: '#fff',
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  btnTextCancel: {
    color: Colors.textSecondary,
  },
  btnTextDestructive: {
    color: '#fff',
  },
});
