import { MaterialIcons } from '@expo/vector-icons';
import React, { ReactNode, useState } from 'react';
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, typography } from '../theme';

export function Screen({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  return <View style={[styles.screen, padded && styles.screenPad]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Body({ children, style, ...props }: TextProps & { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text {...props} style={[styles.body, style]}>
      {children}
    </Text>
  );
}

export function Pill({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.pill, style]}>{children}</View>;
}

export function ActionButton({
  children,
  variant = 'primary',
  style,
  textStyle,
  ...props
}: Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        pressed && styles.pressed,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.buttonText,
            variant !== 'primary' && variant !== 'danger' && styles.buttonTextSecondary,
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function IconRowButton({
  icon,
  title,
  subtitle,
  onPress,
  variant = 'outlined',
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: 'outlined' | 'primary' | 'tinted';
}) {
  const isPrimary = variant === 'primary';
  const isTinted = variant === 'tinted';
  const titleColor = isPrimary ? '#FFFFFF' : colors.text;
  const subtitleColor = isPrimary ? 'rgba(255,255,255,0.78)' : colors.textMuted;
  const iconColor = isPrimary ? '#FFFFFF' : isTinted ? '#FFFFFF' : colors.accent;
  const chevronColor = isPrimary ? '#FFFFFF' : colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowButton,
        isPrimary && styles.rowButtonPrimary,
        isTinted && styles.rowButtonTinted,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          isPrimary && styles.rowIconPrimary,
          isTinted && styles.rowIconTinted,
        ]}
      >
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: titleColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: subtitleColor }]}>{subtitle}</Text>
        ) : null}
      </View>
      <MaterialIcons name="chevron-right" size={24} color={chevronColor} />
    </Pressable>
  );
}

export function Field({
  variant = 'outlined',
  style,
  ...props
}: TextInputProps & { variant?: 'outlined' | 'filled' }) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...props}
      style={[styles.field, variant === 'filled' && styles.fieldFilled, style]}
    />
  );
}

export function OptionCard({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        selected && styles.optionCardSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.optionCardText}>
        <Text style={styles.optionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.optionSubtitle}>{subtitle}</Text> : null}
      </View>
      {selected ? (
        <View style={styles.optionCheck}>
          <MaterialIcons name="check" size={16} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

export function PillGrid<T extends string>({
  values,
  value,
  onChange,
  columns = 'auto',
}: {
  values: readonly T[];
  value?: T;
  onChange: (value: T) => void;
  columns?: 'auto' | 2;
}) {
  return (
    <View style={styles.pillGrid}>
      {values.map((item) => {
        const isSelected = value === item;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={({ pressed }) => [
              styles.pillItem,
              columns === 2 && styles.pillItemHalf,
              isSelected && styles.pillItemSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Dropdown<T extends string>({
  value,
  options,
  placeholder = 'Select...',
  onChange,
  clearable = true,
}: {
  value?: T;
  options: readonly T[];
  placeholder?: string;
  onChange: (value: T | undefined) => void;
  clearable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.dropdown, pressed && styles.pressed]}
      >
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value ?? placeholder}
        </Text>
        <View style={styles.dropdownActions}>
          {value && clearable ? (
            <Pressable
              onPress={() => onChange(undefined)}
              hitSlop={8}
              style={styles.dropdownClear}
            >
              <MaterialIcons name="close" size={14} color="#FFFFFF" />
            </Pressable>
          ) : null}
          <MaterialIcons name="keyboard-arrow-down" size={22} color={colors.text} />
        </View>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <ScrollView>
              {options.map((option) => {
                const isSelected = option === value;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [styles.modalOption, pressed && styles.pressed]}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        isSelected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {isSelected ? (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPad: {
    padding: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  label: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  body: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  rowButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  rowButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rowButtonTinted: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentSoft,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  rowIconPrimary: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  rowIconTinted: {
    backgroundColor: colors.primary,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: typography.bold,
    fontSize: 17,
  },
  rowSubtitle: {
    fontFamily: typography.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  field: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  fieldFilled: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentSoft,
    borderWidth: 1.5,
    color: colors.text,
    fontFamily: typography.bold,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionCardSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  optionCardText: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  optionSubtitle: {
    color: colors.textMuted,
    fontFamily: typography.regular,
    fontSize: 14,
    lineHeight: 19,
  },
  optionCheck: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pillItem: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pillItemHalf: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  pillItemSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  pillText: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 16,
  },
  pillTextSelected: {
    fontFamily: typography.bold,
  },
  dropdown: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    color: colors.text,
    flex: 1,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: colors.textMuted,
    fontFamily: typography.regular,
  },
  dropdownActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dropdownClear: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(23, 35, 31, 0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '70%',
    paddingVertical: 8,
  },
  modalOption: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  modalOptionText: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 17,
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontFamily: typography.bold,
  },
});
