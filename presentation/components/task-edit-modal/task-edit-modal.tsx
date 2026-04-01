import { CloseOutlined } from '@hangar/react-native-icons/core/interaction';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  TaskEditModalController,
  TaskEditTarget,
} from '@/presentation/controllers/use-task-edit-modal-controller';
import { getBottomSystemSpacing } from '@/presentation/utils/native-safe-area';

type TaskEditTextProps = {
  variant?: string;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

type TaskEditModalStyleSet = {
  taskEditModalOverlay: StyleProp<ViewStyle>;
  taskEditModalBackdrop: StyleProp<ViewStyle>;
  taskEditModalCard: StyleProp<ViewStyle>;
  taskEditModalHeader: StyleProp<ViewStyle>;
  taskEditModalTitle: StyleProp<TextStyle>;
  taskEditModalCloseButton: StyleProp<ViewStyle>;
  taskEditModalTimeRow: StyleProp<ViewStyle>;
  taskEditModalField: StyleProp<ViewStyle>;
  taskEditModalFieldLabel: StyleProp<TextStyle>;
  taskEditModalInput: StyleProp<TextStyle>;
  taskEditModalCommentInput: StyleProp<TextStyle>;
  taskEditModalErrorText: StyleProp<TextStyle>;
  taskEditModalDivider: StyleProp<ViewStyle>;
  taskEditModalRestartButton: StyleProp<ViewStyle>;
  taskEditModalRestartButtonText: StyleProp<TextStyle>;
  taskEditModalFooter: StyleProp<ViewStyle>;
  taskEditModalCancelButton: StyleProp<ViewStyle>;
  taskEditModalCancelButtonText: StyleProp<TextStyle>;
  taskEditModalSubmitButton: StyleProp<ViewStyle>;
  taskEditModalSubmitButtonDisabled: StyleProp<ViewStyle>;
  taskEditModalSubmitButtonText: StyleProp<TextStyle>;
};

type TaskEditModalLabels = {
  title: string;
  startLabel: string;
  endLabel: string;
  commentPlaceholder: string;
  restartLabel: string;
  cancelLabel: string;
  submitLabel: string;
  submittingLabel: string;
};

type TaskEditModalVariants = {
  title: string;
  fieldLabel: string;
  button: string;
  error: string;
};

type TaskEditModalProps<TTask extends TaskEditTarget> = {
  controller: TaskEditModalController<TTask>;
  TextComponent: React.ComponentType<TaskEditTextProps>;
  modalStyles: TaskEditModalStyleSet;
  labels?: Partial<TaskEditModalLabels>;
  variants?: Partial<TaskEditModalVariants>;
};

const DEFAULT_LABELS: TaskEditModalLabels = {
  title: 'Editar proceso',
  startLabel: 'Hora de Início',
  endLabel: 'Hora de Término',
  commentPlaceholder: 'Comentário',
  restartLabel: 'Reiniciar proceso',
  cancelLabel: 'Cancelar',
  submitLabel: 'Guardar',
  submittingLabel: 'Guardando...',
};

const DEFAULT_VARIANTS: TaskEditModalVariants = {
  title: 'display-md',
  fieldLabel: 'heading-sm',
  button: 'heading-lg',
  error: 'label-md',
};

export const TaskEditModal = <TTask extends TaskEditTarget>({
  controller,
  TextComponent,
  modalStyles,
  labels,
  variants,
}: TaskEditModalProps<TTask>): JSX.Element => {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const resolvedVariants = { ...DEFAULT_VARIANTS, ...variants };
  const insets = useSafeAreaInsets();
  const bottomSafeSpacing = getBottomSystemSpacing(insets.bottom);
  const enabledInputStyle = {
    backgroundColor: '#ffffff',
    borderColor: '#8d8d8d',
    color: '#303030',
    opacity: 1,
  } as const;
  const disabledInputStyle = {
    backgroundColor: '#f3f3f3',
    borderColor: '#d4d4d4',
    color: '#8d8d8d',
    opacity: 0.75,
  } as const;

  return (
    <Modal
      visible={controller.isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={controller.close}
    >
      <View style={modalStyles.taskEditModalOverlay}>
        <Pressable
          style={modalStyles.taskEditModalBackdrop}
          onPress={controller.close}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            width: '100%',
            alignItems: 'center',
            paddingBottom: bottomSafeSpacing,
          }}
        >
          <View style={modalStyles.taskEditModalCard}>
            <View style={modalStyles.taskEditModalHeader}>
              <TextComponent
                variant={resolvedVariants.title}
                style={modalStyles.taskEditModalTitle}
              >
                {resolvedLabels.title}
              </TextComponent>
              <Pressable
                style={modalStyles.taskEditModalCloseButton}
                onPress={controller.close}
              >
                <CloseOutlined size={28} color="#111111" />
              </Pressable>
            </View>

            <View style={{ gap: 12 }}>
              <View style={modalStyles.taskEditModalTimeRow}>
                {controller.isHito ? (
                  <View style={modalStyles.taskEditModalField}>
                    <TextComponent
                      variant={resolvedVariants.fieldLabel}
                      style={modalStyles.taskEditModalFieldLabel}
                    >
                      Hora
                    </TextComponent>
                    <TextInput
                      value={controller.endTime}
                      onChangeText={controller.changeEndTime}
                      placeholder="00:00"
                      placeholderTextColor="#8d8d8d"
                      style={[
                        modalStyles.taskEditModalInput,
                        controller.isEndEditable
                          ? enabledInputStyle
                          : disabledInputStyle,
                      ]}
                      editable={controller.isEndEditable}
                      selectTextOnFocus={controller.isEndEditable}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                ) : (
                  <>
                    <View style={modalStyles.taskEditModalField}>
                      <TextComponent
                        variant={resolvedVariants.fieldLabel}
                        style={modalStyles.taskEditModalFieldLabel}
                      >
                        {resolvedLabels.startLabel}
                      </TextComponent>
                      <TextInput
                        value={controller.startTime}
                        onChangeText={controller.changeStartTime}
                        placeholder="00:00"
                        placeholderTextColor="#8d8d8d"
                        style={[
                          modalStyles.taskEditModalInput,
                          controller.isStartEditable
                            ? enabledInputStyle
                            : disabledInputStyle,
                        ]}
                        editable={controller.isStartEditable}
                        selectTextOnFocus={controller.isStartEditable}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>

                    <View style={modalStyles.taskEditModalField}>
                      <TextComponent
                        variant={resolvedVariants.fieldLabel}
                        style={modalStyles.taskEditModalFieldLabel}
                      >
                        {resolvedLabels.endLabel}
                      </TextComponent>
                      <TextInput
                        value={controller.endTime}
                        onChangeText={controller.changeEndTime}
                        placeholder="00:00"
                        placeholderTextColor="#8d8d8d"
                        style={[
                          modalStyles.taskEditModalInput,
                          controller.isEndEditable
                            ? enabledInputStyle
                            : disabledInputStyle,
                        ]}
                        editable={controller.isEndEditable}
                        selectTextOnFocus={controller.isEndEditable}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                  </>
                )}
              </View>

              <TextInput
                value={controller.draftComment}
                onChangeText={controller.changeDraftComment}
                multiline
                placeholder={resolvedLabels.commentPlaceholder}
                placeholderTextColor="#8d8d8d"
                style={modalStyles.taskEditModalCommentInput}
                editable={
                  !controller.isReadOnly &&
                  !controller.actionLoading &&
                  !controller.commentsSubmitting
                }
                textAlignVertical="top"
              />

              {controller.actionError || controller.commentsError ? (
                <TextComponent
                  variant={resolvedVariants.error}
                  style={modalStyles.taskEditModalErrorText}
                >
                  {controller.actionError ?? controller.commentsError}
                </TextComponent>
              ) : null}

              <View style={modalStyles.taskEditModalDivider} />

              <Pressable
                style={[
                  modalStyles.taskEditModalRestartButton,
                  !controller.canResetTask || controller.actionLoading
                    ? modalStyles.taskEditModalSubmitButtonDisabled
                    : null,
                ]}
                onPress={controller.resetTask}
                disabled={!controller.canResetTask || controller.actionLoading}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {controller.actionLoading &&
                  controller.activeAction === 'reset' ? (
                    <ActivityIndicator size="small" color="#0a0e80" />
                  ) : null}
                  <TextComponent
                    variant={resolvedVariants.button}
                    style={modalStyles.taskEditModalRestartButtonText}
                  >
                    {controller.actionLoading &&
                    controller.activeAction === 'reset'
                      ? resolvedLabels.submittingLabel
                      : resolvedLabels.restartLabel}
                  </TextComponent>
                </View>
              </Pressable>

              <View style={modalStyles.taskEditModalFooter}>
                <Pressable
                  style={modalStyles.taskEditModalCancelButton}
                  onPress={controller.close}
                  disabled={controller.actionLoading}
                >
                  <TextComponent
                    variant={resolvedVariants.button}
                    style={modalStyles.taskEditModalCancelButtonText}
                  >
                    {resolvedLabels.cancelLabel}
                  </TextComponent>
                </Pressable>

                <Pressable
                  style={[
                    modalStyles.taskEditModalSubmitButton,
                    !controller.canPerformPrimaryAction ||
                    controller.actionLoading
                      ? modalStyles.taskEditModalSubmitButtonDisabled
                      : null,
                  ]}
                  onPress={controller.performPrimaryAction}
                  disabled={
                    !controller.canPerformPrimaryAction ||
                    controller.actionLoading
                  }
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {controller.actionLoading &&
                    controller.activeAction === 'primary' ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : null}
                    <TextComponent
                      variant={resolvedVariants.button}
                      style={modalStyles.taskEditModalSubmitButtonText}
                    >
                      {controller.actionLoading &&
                      controller.activeAction === 'primary'
                        ? resolvedLabels.submittingLabel
                        : controller.primaryActionLabel}
                    </TextComponent>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
