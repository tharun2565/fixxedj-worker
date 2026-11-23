import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getFaceDraft } from '../state/faceOnboardingDraft';
import { getOnboardingMeta } from '../state/onboardingMeta';
import { colors, fontFamilies } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const TRADE_LABEL: Record<string, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  appliances: 'Appliances',
  maid: 'Maid Service',
};

type MenuId = 'info' | 'payout' | 'support' | 'terms' | 'policies';

const MENU: { id: MenuId; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'info', label: 'Your information', icon: 'badge' },
  { id: 'payout', label: 'Payout account', icon: 'account-balance' },
  { id: 'support', label: 'Customer support', icon: 'support-agent' },
  { id: 'terms', label: 'Terms & conditions', icon: 'description' },
  { id: 'policies', label: 'Booking policies', icon: 'policy' },
];

function maskAadhaar(value?: string) {
  if (!value || value.length < 4) return 'Not submitted';
  return `XXXX-XXXX-${value.slice(-4)}`;
}

function maskPan(value?: string) {
  if (!value || value.length < 4) return 'Not submitted';
  return `${value.slice(0, 3)}XXXXX${value.slice(-1)}`;
}

export function CaptainSideDrawer({ visible, onClose, onLogout }: Props) {
  const insets = useSafeAreaInsets();
  const draft = getFaceDraft();
  const meta = getOnboardingMeta();
  const [view, setView] = useState<'menu' | 'info' | 'payout'>('menu');
  const name = draft.fullName.trim() || 'Captain';
  const service =
    meta.trades.map((t) => TRADE_LABEL[t] ?? t).join(' · ') || 'Captain';

  const close = () => {
    setView('menu');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.panel,
            {
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View style={styles.panelHeader}>
            {view !== 'menu' ? (
              <Pressable
                onPress={() => setView('menu')}
                style={styles.headerBtn}
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={22} color={colors.black} />
              </Pressable>
            ) : (
              <View style={styles.headerBtn} />
            )}
            <Text style={styles.panelTitle}>
              {view === 'info'
                ? 'Your information'
                : view === 'payout'
                  ? 'Payout account'
                  : 'Profile'}
            </Text>
            <Pressable onPress={close} style={styles.headerBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.black} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {view === 'menu' ? (
              <>
                <View style={styles.profileCard}>
                  {draft.photoUri ? (
                    <Image source={{ uri: draft.photoUri }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Ionicons name="person" size={36} color={colors.brand} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {name}
                      </Text>
                      <MaterialIcons name="verified" size={16} color={colors.brand} />
                    </View>
                    <Text style={styles.verified}>Verified Captain</Text>
                    <Text style={styles.service}>{service}</Text>
                  </View>
                </View>

                <View style={styles.menuCard}>
                  {MENU.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.menuRow}
                      onPress={() => {
                        if (item.id === 'info') setView('info');
                        if (item.id === 'payout') setView('payout');
                      }}
                    >
                      <View style={styles.menuLeft}>
                        <View style={styles.menuIcon}>
                          <MaterialIcons
                            name={item.icon}
                            size={18}
                            color={colors.brand}
                          />
                        </View>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.slate400}
                      />
                    </Pressable>
                  ))}
                </View>

                <Pressable style={styles.logoutBtn} onPress={onLogout}>
                  <Ionicons name="log-out-outline" size={18} color={colors.error} />
                  <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
              </>
            ) : view === 'info' ? (
              <View style={styles.infoCard}>
                <InfoRow label="Name" value={name} />
                <InfoRow label="Application ID" value={meta.applicationId} />
                <Text style={styles.docsTitle}>Submitted documents</Text>
                <View style={styles.docRow}>
                  <MaterialIcons name="badge" size={18} color={colors.brand} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docLabel}>Aadhaar</Text>
                    <Text style={styles.docValue}>{maskAadhaar(draft.aadhaar)}</Text>
                  </View>
                </View>
                <View style={styles.docRow}>
                  <MaterialIcons name="credit-card" size={18} color={colors.brand} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docLabel}>PAN</Text>
                    <Text style={styles.docValue}>{maskPan(draft.pan)}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <Text style={styles.docsTitle}>Scheduled payout bank</Text>
                <View style={styles.docRow}>
                  <MaterialIcons name="account-balance" size={18} color={colors.brand} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docLabel}>HDFC Bank</Text>
                    <Text style={styles.docValue}>
                      {name} · ****4821 · Verified
                    </Text>
                  </View>
                </View>
                <Text style={styles.payoutNote}>
                  Manage banks and withdraw from the Wallet tab.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
        <Pressable style={styles.scrim} onPress={close} />
      </View>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    width: '84%',
    maxWidth: 360,
    backgroundColor: '#F7F9FF',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  scrim: { flex: 1 },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    minHeight: 48,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitle: {
    fontFamily: fontFamilies.sansExtraBold,
    fontSize: 17,
    color: colors.black,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },
  profileCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(58,134,255,0.18)',
    padding: 14,
    shadowColor: colors.brand,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 16,
    color: colors.black,
    maxWidth: 150,
  },
  verified: {
    marginTop: 2,
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    color: colors.brand,
  },
  service: {
    marginTop: 2,
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate600,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
    color: colors.black,
  },
  logoutBtn: {
    marginTop: 4,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 14,
    color: colors.error,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    color: colors.slate500,
  },
  infoValue: {
    flexShrink: 1,
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
    textAlign: 'right',
  },
  docsTitle: {
    marginTop: 4,
    fontFamily: fontFamilies.sansBold,
    fontSize: 13,
    color: colors.black,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3F8FF',
    borderRadius: 12,
    padding: 12,
  },
  docLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    color: colors.slate500,
  },
  payoutNote: {
    marginTop: 8,
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    color: colors.slate600,
    lineHeight: 17,
  },
  docValue: {
    marginTop: 2,
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    color: colors.black,
  },
});
