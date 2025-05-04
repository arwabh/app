// components/RoundedInput.tsx
import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';

interface Props extends TextInputProps {
  icon: keyof typeof MaterialIcons.glyphMap;
}

export default function RoundedInput({ icon, ...props }: Props) {
  return (
    <View style={styles.inputWrapper}>
      <MaterialIcons name={icon} size={20} color={colors.accent} style={styles.icon} />
      <TextInput
        {...props}
        style={[styles.input, props.style]}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.accent,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
});
