import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ComposerInput, ConfirmDialog, LoopText, Screen, ScreenHeader } from '@/components/ui';
import { LoopColors, LoopMotion } from '@/constants/loop-theme';
import {
  CoachAvatar,
  CoachLine,
  CreateProposalCard,
  RetroProposalCard,
  UserLine,
} from '@/features/chat/components';
import { lastAssistantHasText } from '@/features/chat/messages';
import { reportAiContent } from '@/features/chat/report';
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

  // AI content reporting (Play AI-Generated Content policy): long-press a Loopi reply to flag it.
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportResult, setReportResult] = useState<'done' | 'fail' | null>(null);

  function send() {
    if (!input.trim()) return;
    const content = input;
    setInput('');
    void chat.sendText(content);
  }

  async function confirmReport() {
    if (!reportTarget) return;
    setReportBusy(true);
    try {
      await reportAiContent(chat.getSessionId(), reportTarget);
      setReportResult('done');
    } catch {
      setReportResult('fail');
    } finally {
      setReportBusy(false);
      setReportTarget(null);
    }
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
          <LoopText variant="caption" color="ink4" style={styles.aiNotice}>
            {t('chat.aiNotice')}
          </LoopText>
          {chat.messages.map((m, i) =>
            m.role === 'user' ? (
              <UserLine key={i} text={m.content} />
            ) : m.content ? (
              <CoachLine key={i} text={m.content} onLongPress={() => setReportTarget(m.content)} />
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

      <ConfirmDialog
        visible={!!reportTarget}
        icon="flag"
        title={t('chat.report.title')}
        message={t('chat.report.msg')}
        confirmLabel={t('chat.report.confirm')}
        cancelLabel={t('common.cancel')}
        loading={reportBusy}
        onConfirm={confirmReport}
        onCancel={() => setReportTarget(null)}
      />
      <ConfirmDialog
        visible={!!reportResult}
        icon="flag"
        title={t(reportResult === 'fail' ? 'chat.report.fail.title' : 'chat.report.done.title')}
        message={t(reportResult === 'fail' ? 'chat.report.fail.msg' : 'chat.report.done.msg')}
        confirmLabel={t('common.ok')}
        onConfirm={() => setReportResult(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 15 },
  sub: { marginTop: 2 },
  scroll: { paddingHorizontal: 26, paddingTop: 6, paddingBottom: 12, gap: 22 },
  aiNotice: { marginTop: -12 },
  typing: { alignSelf: 'flex-start' },
  bottomSpacer: { height: 6 },
});
