import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { LoopColors, LoopFont, LoopRadius } from '../tokens/theme';

import { Icon } from './icon';
import { PressScale } from './press-scale';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Search input — leading magnifier, inline clear button. */
export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  autoFocus,
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Icon name="search" size={18} color={LoopColors.ink4} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={LoopColors.ink4}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={styles.input}
      />
      {value.length > 0 && (
        <PressScale onPress={() => onChangeText('')} hitSlop={8}>
          <Icon name="close" size={16} color={LoopColors.ink4} />
        </PressScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: LoopRadius.full,
    borderWidth: 1,
    borderColor: LoopColors.line,
    backgroundColor: LoopColors.surface,
  },
  input: { flex: 1, fontFamily: LoopFont.medium, fontSize: 15, color: LoopColors.ink, padding: 0 },
});
