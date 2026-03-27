import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/presentation/components/design-system';

export type EditProcessModalProps = {
  visible: boolean;
  processName: string;
  startTime: string;
  endTime: string;
  /** Controls which action buttons appear — defaults to 'completed' (show both) */
  statusTone?: 'pending' | 'in_progress' | 'completed';
  onClose: () => void;
  onSave: (startTime: string, endTime: string, comment: string) => void;
  onReset: () => void;
};

/** Masks raw keystrokes into strict "HH:mm" — strips non-digits, re-inserts colon at position 2. */
const maskTimeInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

export const EditProcessModal = ({
  visible,
  processName,
  startTime: initialStart,
  endTime: initialEnd,
  statusTone = 'completed',
  onClose,
  onSave,
  onReset,
}: EditProcessModalProps) => {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (visible) {
      setStart(initialStart);
      setEnd(initialEnd);
      setComment('');
    }
  }, [visible, initialStart, initialEnd]);

  const handleSave = () => {
    onSave(start, end, comment);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardWrapper}
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="heading-sm" style={styles.title}>
                Editar proceso
              </Text>
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <Text variant="heading-sm" style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            {/* Time inputs — show relevant fields based on statusTone */}
            <View style={styles.timeRow}>
              {statusTone !== 'in_progress' && (
                <View style={styles.timeBlock}>
                  <Text variant="label-sm" style={styles.label}>
                    Hora de Início
                  </Text>
                  <TextInput
                    style={styles.timeInput}
                    value={start}
                    onChangeText={(v) => setStart(maskTimeInput(v))}
                    placeholder="--:--"
                    placeholderTextColor="#aaa"
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              )}
              {statusTone !== 'pending' && (
                <View style={styles.timeBlock}>
                  <Text variant="label-sm" style={styles.label}>
                    Hora de Término
                  </Text>
                  <TextInput
                    style={styles.timeInput}
                    value={end}
                    onChangeText={(v) => setEnd(maskTimeInput(v))}
                    placeholder="--:--"
                    placeholderTextColor="#aaa"
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              )}
            </View>

            {/* Comment */}
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Comentário"
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Reset button */}
            <Pressable style={styles.resetBtn} onPress={onReset}>
              <Text variant="label-lg" style={styles.resetText}>
                Reiniciar proceso
              </Text>
            </Pressable>

            {/* Cancel / Save */}
            <View style={styles.actionRow}>
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text variant="label-lg" style={styles.cancelText}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable style={[styles.saveBtn, statusTone === 'in_progress' && styles.saveBtnTerminar]} onPress={handleSave}>
                <Text variant="label-lg" style={styles.saveText}>
                  {statusTone === 'pending' ? 'Começar' : statusTone === 'in_progress' ? 'Terminar' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardWrapper: {
    width: '100%',
    maxWidth: 560,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#0a0e80',
    fontSize: 22,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  closeIcon: {
    color: '#303030',
    fontSize: 20,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeBlock: {
    flex: 1,
    gap: 6,
  },
  label: {
    color: '#303030',
    fontWeight: '600',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#303030',
    backgroundColor: '#fff',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#303030',
    minHeight: 100,
    backgroundColor: '#fff',
  },
  resetBtn: {
    backgroundColor: '#c2005b',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#c2005b',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelText: {
    color: '#c2005b',
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2c31c9',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnTerminar: {
    backgroundColor: '#c4073f',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
