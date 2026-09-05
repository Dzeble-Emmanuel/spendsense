import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface PrimaryButtonProps extends TouchableOpacityProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  isLoading = false,
  icon,
  color,
  style,
  textStyle,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const { theme } = useTheme();
  const backgroundColor = color || theme.primary;

  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        { backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon}
          <Text style={[styles.primaryText, textStyle]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

interface SecondaryButtonProps extends TouchableOpacityProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function SecondaryButton({
  label,
  onPress,
  icon,
  style,
  textStyle,
  disabled,
  ...props
}: SecondaryButtonProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.secondaryButton,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderAccent || theme.border,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {icon}
      <Text style={[styles.secondaryText, { color: theme.primary }, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
});
