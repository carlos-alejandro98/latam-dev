import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { FlightComment } from '@/domain/entities/flight-comment';
import type { CommentsDrawerProps } from '@/presentation/screens/homeScreen/components/comments-drawer/comments-drawer.types';

import { styles } from './comments-drawer.styles.native';

import type { ReactElement } from 'react';
import type { ListRenderItemInfo } from 'react-native';

const ANIMATION_DURATION_MS = 240;

const formatCommentHour = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const CommentRow = ({ comment }: { comment: FlightComment }): ReactElement => {
  return (
    <View style={styles.commentRow}>
      <View style={styles.authorBadge}>
        <Text style={styles.authorBadgeText}>{comment.authorCode}</Text>
      </View>
      <View style={styles.commentBubble}>
        <Text style={styles.commentAuthor}>{comment.authorName}</Text>
        <Text style={styles.commentMessage}>{comment.message}</Text>
        <Text style={styles.commentTime}>
          {formatCommentHour(comment.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const renderCommentItem = ({
  item,
}: ListRenderItemInfo<FlightComment>): ReactElement => {
  return <CommentRow comment={item} />;
};

export const CommentsDrawer = ({
  isOpen,
  drawerWidth,
  comments,
  loading,
  submitting,
  draftComment,
  canComment,
  canSendComment,
  error,
  onClose,
  onChangeDraftComment,
  onSendComment,
}: CommentsDrawerProps): ReactElement | null => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const isOpenRef = useRef(isOpen);
  const animationValue = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      Animated.timing(animationValue, {
        toValue: 1,
        duration: ANIMATION_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(animationValue, {
      toValue: 0,
      duration: ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !isOpenRef.current) {
        setShouldRender(false);
      }
    });
  }, [animationValue, isOpen]);

  if (!shouldRender) {
    return null;
  }

  const drawerTranslateX = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });
  const backdropOpacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            minWidth: drawerWidth,
            maxWidth: drawerWidth,
            transform: [{ translateX: drawerTranslateX }],
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonLabel}>x</Text>
          </Pressable>
          <Text style={styles.title}>Editar Proceso</Text>
        </View>

        <View style={styles.processSection}>
          <Text style={styles.processTitle}>Desembarque de PAX</Text>
          <View style={styles.timeFields}>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>Start</Text>
              <Text style={styles.timeValue}>05:17</Text>
            </View>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>End</Text>
              <Text style={styles.timeValue}>05:27</Text>
            </View>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Comentarios</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderCommentItem}
            style={styles.commentsList}
            contentContainerStyle={styles.commentsContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {loading
                  ? 'Cargando comentarios...'
                  : 'Sin comentarios disponibles.'}
              </Text>
            }
          />
        </View>

        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            value={draftComment}
            placeholder="Comentario"
            editable={canComment && !submitting}
            onChangeText={onChangeDraftComment}
            onSubmitEditing={canComment ? onSendComment : undefined}
            returnKeyType="send"
          />
          <Pressable
            onPress={onSendComment}
            disabled={!canSendComment}
            style={[
              styles.sendButton,
              canSendComment
                ? styles.sendButtonEnabled
                : styles.sendButtonDisabled,
            ]}
          >
            <Text style={styles.sendButtonLabel}>
              {submitting ? 'Enviando...' : 'Enviar'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>
    </View>
  );
};
