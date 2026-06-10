import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ComposerInput, LoopText, Screen, ScreenHeader } from '@/components/ui';
import { LoopColors, LoopMotion } from '@/constants/loop-theme';
import {
  CoachAvatar,
  CoachLine,
  CreateProposalCard,
  RetroProposalCard,
  UserLine,
} from '@/features/chat/components';
import { lastAssistantHasText } from '@/features/chat/messages';
import { useLoopiChat } from '@/features/chat/use-loopi-chat';
import { useT } from '@/lib/i18n';
import { type SessionMode } from '@/types/models';

type UiMode = 'write' | 'reflect';

export default function LoopiChatScreen() {
  const { mode, initial } = useLocalSearchParams<{ mode: UiMode; initial?: string }>();
  const uiMode: UiMode = mode === 'reflect' ? 'reflect' : 'write';
  const serverMode: SessionMode = uiMode === 'reflect' ? 'retrospective' : 'write';

  const router = useRouter();
  const t = useT();
  const chat = useLoopiChat(serverMode, initial);
  // Const binding so TS narrows `proposal.kind` inside the JSX callbacks below.
  const { proposal } = chat;

  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  function send() {
    if (!input.trim()) return;
    const content = input;
    setInput('');
    void chat.sendText(content);
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader onBack={() => router.back()}>
        <CoachAvatar />
        <View style={styles.flex}>
          <LoopText variant="heading2" style={styles.title}>
            {uiMode === 'reflect' ? t('chat.title.reflect') : t('chat.title.write')}
          </LoopText>
          <LoopText variant="small" color="warmDeep" style={styles.sub}>
            {t('chat.sub')}
          </LoopText>
        </View>
      </ScreenHeader>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          <CoachLine
            text={uiMode === 'reflect' ? t('chat.intro.reflect') : t('chat.intro.write')}
          />
          {chat.messages.map((m, i) =>
            m.role === 'user' ? (
              <UserLine key={i} text={m.content} />
            ) : m.content ? (
              <CoachLine key={i} text={m.content} />
            ) : null,
          )}
          {/* Show the typing indicator only until the first token (once streaming starts, text is shown instead). */}
          {chat.sending && !lastAssistantHasText(chat.messages) && (
            <ActivityIndicator color={LoopColors.warm} size="small" style={styles.typing} />
          )}

          {/* Proposal cards land mid-conversation — fade them in so the layout shift reads as arrival, not a glitch. */}
          {proposal?.kind === 'create_feedback' && (
            <Animated.View entering={FadeIn.duration(LoopMotion.timing.base)}>
              <CreateProposalCard
                proposal={proposal}
                busy={chat.applying}
                onAccept={() => chat.acceptWrite(proposal)}
                onDismiss={chat.dismissProposal}
              />
            </Animated.View>
          )}
          {proposal?.kind === 'update_feedback' && (
            <Animated.View entering={FadeIn.duration(LoopMotion.timing.base)}>
              <RetroProposalCard
                proposal={proposal}
                busy={chat.applying}
                onAccept={() => chat.acceptRetro(proposal)}
                onDismiss={chat.dismissProposal}
              />
            </Animated.View>
          )}
        </ScrollView>

        <ComposerInput
          value={input}
          onChangeText={setInput}
          onSend={send}
          disabled={chat.sending}
          placeholder={uiMode === 'reflect' ? t('chat.ph.reflect') : t('chat.ph.write')}
        />
        <View style={styles.bottomSpacer} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 15 },
  sub: { marginTop: 2 },
  scroll: { paddingHorizontal: 26, paddingTop: 6, paddingBottom: 12, gap: 22 },
  typing: { alignSelf: 'flex-start' },
  bottomSpacer: { height: 6 },
});
