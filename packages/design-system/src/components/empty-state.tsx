import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoopColors } from '../tokens/theme';

import { Card } from './card';
import { Icon, type IconName } from './icon';
import { LoopText } from './text';

/** Centered empty placeholder — icon + title + body. `plain` skips the card surface (e.g. inside lists). */
export const EmptyState = memo(function EmptyState({
  icon = 'loop',
  title,
  body,
  plain,
}: {
  icon?: IconName;
  title: string;
  body: string;
  plain?: boolean;
}) {
  const content = (
    <>
      <Icon name={icon} size={28} color={LoopColors.warm} />
      <LoopText variant="cardTitle" style={styles.title}>
        {title}
      </LoopText>
      <LoopText variant="bodyTight" color="ink3" style={styles.body}>
        {body}
      </LoopText>
    </>
  );
  if (plain) return <View style={styles.plain}>{content}</View>;
  return (
    <Card radius={22} style={styles.card}>
      {content}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { padding: 24, alignItems: 'center' },
  plain: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 14 },
  title: { marginTop: 12, textAlign: 'center' },
  body: { marginTop: 6, textAlign: 'center' },
});
