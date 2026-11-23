import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamilies, spacing } from '../theme';

type BrandHeaderProps = {
  variant?: 'welcome' | 'login';
  showLanguage?: boolean;
  showHelp?: boolean;
  centered?: boolean;
  onBack?: () => void;
  onLanguagePress?: () => void;
  onHelpPress?: () => void;
};

export function BrandHeader({
  variant = 'login',
  showLanguage = true,
  showHelp = true,
  centered = false,
  onBack,
  onLanguagePress,
  onHelpPress,
}: BrandHeaderProps) {
  if (centered) {
    return (
      <View style={styles.centeredRow}>
        {onBack ? (
          <Pressable accessibilityLabel="Go back" onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.slate600} />
          </Pressable>
        ) : (
          <View style={styles.sideSlot} />
        )}
        <Text style={styles.centeredBrand}>
          Fixxedj <Text style={styles.brandAccent}>Captain</Text>
        </Text>
        <View style={styles.sideSlot} />
      </View>
    );
  }

  return (
    <View style={[styles.row, variant === 'welcome' && styles.welcomePad]}>
      <View style={styles.brandRow}>
        {variant === 'welcome' ? <View style={styles.dot} /> : null}
        <Text style={styles.brand}>
          Fixxedj <Text style={styles.brandAccent}>Captain</Text>
        </Text>
      </View>
      {(showLanguage || showHelp) && (
        <View style={styles.actions}>
          {showLanguage ? (
            <Pressable
              accessibilityLabel="Select Language"
              onPress={onLanguagePress}
              style={[styles.langChip, variant === 'login' && styles.langChipLogin]}
            >
              {variant === 'login' ? (
                <Ionicons name="language-outline" size={15} color={colors.slate700} />
              ) : null}
              <Text style={styles.langText}>
                EN <Text style={styles.langDivider}>/</Text>{' '}
                <Text style={styles.langSecondary}>हिन्दी</Text>
              </Text>
            </Pressable>
          ) : null}
          {showHelp ? (
            <Pressable
              accessibilityLabel="Help Center"
              onPress={onHelpPress}
              style={styles.helpBtn}
            >
              <Ionicons name="help-circle-outline" size={18} color={colors.slate600} />
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  welcomePad: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
  },
  brand: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 15,
    letterSpacing: -0.2,
    textTransform: 'uppercase',
    color: colors.slate950,
  },
  brandAccent: {
    color: colors.brand,
    fontFamily: fontFamilies.sansExtraBold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  langChipLogin: {
    backgroundColor: colors.surfaceContainer,
    borderColor: 'rgba(195, 198, 215, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  langText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    color: colors.slate700,
  },
  langDivider: {
    color: colors.slate300,
  },
  langSecondary: {
    color: colors.slate500,
    fontFamily: fontFamilies.sansMedium,
  },
  helpBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  centeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 48,
  },
  centeredBrand: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 20,
    color: colors.slate900,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSlot: {
    width: 40,
  },
});
