import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import {
  PrimitiveTokens,
  SemanticDarkTokens,
  SemanticLightTokens,
  TypographyScale,
} from '@/theme/tokens.generated';
import { triggerHaptic } from '@/utils/haptics';
import { RoutineSathyEmblem } from './RoutineSathyEmblem';

export interface SathyChatModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  score: number;
  waterIntake: number;
  targetWater: number;
  studyHours: number;
  targetStudy: number;
  wakeUpTime?: string;
  onAddWater: (amount: number) => void;
  onAddStudy: (hours: number) => void;
  onLogWakeUp: (time: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'sathy' | 'user';
  text: string;
  time: string;
}

export function SathyChatModal({
  visible,
  onClose,
  userName,
  score,
  waterIntake,
  targetWater,
  studyHours,
  targetStudy,
  wakeUpTime,
  onAddWater,
  onAddStudy,
  onLogWakeUp,
}: SathyChatModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const firstName = userName ? userName.split(' ')[0] : 'there';

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let initGreeting = '';
    if (score >= 100) {
      initGreeting = `Shaandar, ${firstName}! 🎯 Aaj pure 100/100 points ho gaye. Sunrise streak bilkul safe hai. Kaisa feel ho raha hai?`;
    } else if (!wakeUpTime) {
      initGreeting = `Good morning, ${firstName}! 🌅 Aaj ka din shuru karte hain. Subah ka wake-up log karein ya +250ml paani se start karein?`;
    } else {
      initGreeting = `Namaste, ${firstName}! 🌿 Aaj ka score ${score}/100 hai. Ek quick tap se paani ya study add kar sakte ho!`;
    }
    return [
      {
        id: 'msg_1',
        sender: 'sathy',
        text: initGreeting,
        time: nowTime,
      },
    ];
  });

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    triggerHaptic('light');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userText = inputMessage.trim();
    setInputMessage('');

    const newMsgs: ChatMessage[] = [
      ...messages,
      {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: userText,
        time: nowTime,
      },
    ];
    setMessages(newMsgs);

    // Warm companion response
    setTimeout(() => {
      triggerHaptic('medium');
      let botReply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('water') || lower.includes('paani') || lower.includes('pani')) {
        botReply = `Great reminder! Hydration se energy high rehti hai. Neeche diye chip se +250ml ya +500ml tap kar lo! 💧`;
      } else if (lower.includes('study') || lower.includes('focus') || lower.includes('padhai')) {
        botReply = `Deep focus block shuru karne ke liye best of luck! 📚 Khula aasmaan aur shaant dimaag se study karo.`;
      } else if (lower.includes('thak') || lower.includes('tired') || lower.includes('sleep') || lower.includes('so')) {
        botReply = `Koi baat nahi, rest bhi routine ka zaroori hissa hai. Jitna ho saka utna kiya, that is enough. Kal subah milte hain! 🌙`;
      } else {
        botReply = `Main sun raha hoon, ${firstName}! Har chhota kadam routine ko strong banata hai. Always here for you! ✨`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `sathy_${Date.now()}`,
          sender: 'sathy',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 450);
  };

  const handleChipAction = (type: 'water250' | 'water500' | 'study30' | 'study60' | 'wake') => {
    triggerHaptic('medium');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let userMsg = '';
    let botReply = '';

    if (type === 'water250') {
      onAddWater(0.25);
      userMsg = '+250ml Paani log kiya 💧';
      botReply = `Badhiya! +250ml add ho gaya. Ab total ${(waterIntake + 0.25).toFixed(2)}L ho gaya hai. Keep hydrating! 🌿`;
    } else if (type === 'water500') {
      onAddWater(0.5);
      userMsg = '+500ml Paani log kiya 💧';
      botReply = `Shaandar! Ek poora glass paani add ho gaya. Ab ${(waterIntake + 0.5).toFixed(2)}L / ${targetWater}L reached! ✨`;
    } else if (type === 'study30') {
      onAddStudy(0.5);
      userMsg = '+30 mins Study & Focus log kiya 📚';
      botReply = `Solid focus block! +30 minutes study points jud gaye hain. Total ${(studyHours + 0.5).toFixed(1)}h done! 🎯`;
    } else if (type === 'study60') {
      onAddStudy(1.0);
      userMsg = '+1 Hour Study & Focus log kiya 📖';
      botReply = `Superb deep study session! +1 hour study add ho gaya. Daily score improve ho raha hai! 🚀`;
    } else if (type === 'wake') {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      onLogWakeUp(currentTime);
      userMsg = `Wake-up log kiya: ${currentTime} ☀️`;
      botReply = `Morning anchor set at ${currentTime}! Morning wake-up ke +30 points aapke score mein add ho gaye! 🌅`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: userMsg,
        time: nowTime,
      },
      {
        id: `sathy_${Date.now() + 1}`,
        sender: 'sathy',
        text: botReply,
        time: nowTime,
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.surface,
              paddingTop: PrimitiveTokens.space[3],
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.borderSubtle }]}>
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.emblemCircle,
                  {
                    backgroundColor: theme.isDark
                      ? SemanticDarkTokens.color.bg.tileMint
                      : SemanticLightTokens.color.bg.tileMint,
                  },
                ]}>
                <RoutineSathyEmblem size={26} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                  Sathy
                </Text>
                <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
                  Your Routine Companion
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close Chat"
              style={[
                styles.closeBtn,
                { backgroundColor: theme.colors.surfaceAlt },
              ]}>
              <Ionicons name="close" size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Messages ScrollView */}
          <ScrollView
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.msgRow,
                    isUser ? styles.msgRowUser : styles.msgRowSathy,
                  ]}>
                  {!isUser && (
                    <View
                      style={[
                        styles.sathyMiniAvatar,
                        {
                          backgroundColor: theme.isDark
                            ? SemanticDarkTokens.color.bg.tileMint
                            : SemanticLightTokens.color.bg.tileMint,
                        },
                      ]}>
                      <Ionicons
                        name="sparkles"
                        size={12}
                        color={theme.colors.success}
                      />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isUser
                        ? [
                            styles.userBubble,
                            {
                              backgroundColor: theme.isDark
                                ? PrimitiveTokens.color.forest[700]
                                : PrimitiveTokens.color.forest[900],
                            },
                          ]
                        : [
                            styles.sathyBubble,
                            {
                              backgroundColor: theme.colors.surfaceAlt,
                              borderColor: theme.colors.borderSubtle,
                            },
                          ],
                    ]}>
                    <Text
                      style={[
                        styles.bubbleText,
                        {
                          color: isUser
                            ? PrimitiveTokens.color.neutral[0]
                            : theme.colors.text,
                        },
                      ]}>
                      {m.text}
                    </Text>
                    <Text
                      style={[
                        styles.timeText,
                        {
                          color: isUser
                            ? 'rgba(255,255,255,0.6)'
                            : theme.colors.textMuted,
                        },
                      ]}>
                      {m.time}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick Action Chips */}
          <View style={[styles.chipsContainer, { borderTopColor: theme.colors.borderSubtle }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}>
              <Pressable
                onPress={() => handleChipAction('water250')}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.isDark
                      ? SemanticDarkTokens.color.bg.tileSky
                      : SemanticLightTokens.color.bg.tileSky,
                    borderColor: theme.isDark
                      ? 'rgba(2, 132, 199, 0.35)'
                      : PrimitiveTokens.color.sky[200],
                  },
                ]}>
                <Ionicons name="water" size={13} color="#0284C7" />
                <Text style={[styles.chipText, { color: theme.isDark ? '#38BDF8' : '#0284C7' }]}>
                  +250ml Water
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleChipAction('water500')}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.isDark
                      ? SemanticDarkTokens.color.bg.tileSky
                      : SemanticLightTokens.color.bg.tileSky,
                    borderColor: theme.isDark
                      ? 'rgba(2, 132, 199, 0.35)'
                      : PrimitiveTokens.color.sky[200],
                  },
                ]}>
                <Ionicons name="water" size={13} color="#0284C7" />
                <Text style={[styles.chipText, { color: theme.isDark ? '#38BDF8' : '#0284C7' }]}>
                  +500ml Water
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleChipAction('study30')}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.isDark
                      ? SemanticDarkTokens.color.bg.tileIndigo
                      : SemanticLightTokens.color.bg.tileIndigo,
                    borderColor: theme.isDark
                      ? 'rgba(79, 70, 229, 0.35)'
                      : PrimitiveTokens.color.indigo[200],
                  },
                ]}>
                <Ionicons name="book" size={13} color="#4F46E5" />
                <Text style={[styles.chipText, { color: theme.isDark ? '#818CF8' : '#4F46E5' }]}>
                  +30m Study
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleChipAction('study60')}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.isDark
                      ? SemanticDarkTokens.color.bg.tileIndigo
                      : SemanticLightTokens.color.bg.tileIndigo,
                    borderColor: theme.isDark
                      ? 'rgba(79, 70, 229, 0.35)'
                      : PrimitiveTokens.color.indigo[200],
                  },
                ]}>
                <Ionicons name="hourglass" size={13} color="#4F46E5" />
                <Text style={[styles.chipText, { color: theme.isDark ? '#818CF8' : '#4F46E5' }]}>
                  +1h Study
                </Text>
              </Pressable>

              {!wakeUpTime && (
                <Pressable
                  onPress={() => handleChipAction('wake')}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: theme.isDark
                        ? SemanticDarkTokens.color.bg.tileAmber
                        : SemanticLightTokens.color.bg.tileAmber,
                      borderColor: theme.isDark
                        ? 'rgba(251, 191, 36, 0.35)'
                        : PrimitiveTokens.color.amber[200],
                    },
                  ]}>
                  <Ionicons name="sunny" size={13} color="#D97706" />
                  <Text style={[styles.chipText, { color: theme.isDark ? '#FBBF24' : '#B45309' }]}>
                    Log Wake-up
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          </View>

          {/* Input Row */}
          <View style={[styles.inputRow, { borderTopColor: theme.colors.borderSubtle }]}>
            <TextInput
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Message Sathy..."
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputMessage.trim()}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputMessage.trim()
                    ? theme.isDark
                      ? PrimitiveTokens.color.fern[400]
                      : PrimitiveTokens.color.forest[800]
                    : theme.colors.surfaceAlt,
                },
              ]}>
              <Ionicons
                name="arrow-up"
                size={18}
                color={
                  inputMessage.trim()
                    ? '#FFFFFF'
                    : theme.colors.textMuted
                }
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '88%',
    borderTopLeftRadius: PrimitiveTokens.radius['3xl'],
    borderTopRightRadius: PrimitiveTokens.radius['3xl'],
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PrimitiveTokens.space[4],
    paddingBottom: PrimitiveTokens.space[3],
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PrimitiveTokens.space['2_5'],
  },
  emblemCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TypographyScale.bodyStrong.fontSize,
    fontFamily: TypographyScale.bodyStrong.fontFamily,
    fontWeight: TypographyScale.bodyStrong.fontWeight,
  },
  headerSub: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatScroll: {
    flexGrow: 1,
    paddingHorizontal: PrimitiveTokens.space[4],
  },
  chatContent: {
    paddingVertical: PrimitiveTokens.space[4],
    gap: PrimitiveTokens.space[3],
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: PrimitiveTokens.space[2],
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowSathy: {
    justifyContent: 'flex-start',
  },
  sathyMiniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: PrimitiveTokens.space[3],
    paddingVertical: PrimitiveTokens.space['2_5'],
    borderRadius: PrimitiveTokens.radius.lg,
  },
  userBubble: {
    borderBottomRightRadius: PrimitiveTokens.radius.xs,
  },
  sathyBubble: {
    borderBottomLeftRadius: PrimitiveTokens.radius.xs,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
    lineHeight: TypographyScale.bodySm.lineHeight,
  },
  timeText: {
    fontSize: 9,
    fontFamily: TypographyScale.captionSm.fontFamily,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chipsContainer: {
    paddingVertical: PrimitiveTokens.space[2],
    borderTopWidth: 1,
  },
  chipsScroll: {
    paddingHorizontal: PrimitiveTokens.space[4],
    gap: PrimitiveTokens.space[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: PrimitiveTokens.space[3],
    paddingVertical: PrimitiveTokens.space['1_5'],
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: TypographyScale.captionSm.fontSize,
    fontFamily: TypographyScale.captionSm.fontFamily,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PrimitiveTokens.space[4],
    paddingTop: PrimitiveTokens.space[2],
    gap: PrimitiveTokens.space[2],
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: PrimitiveTokens.space[3],
    borderRadius: PrimitiveTokens.radius.full,
    borderWidth: 1,
    fontSize: TypographyScale.bodySm.fontSize,
    fontFamily: TypographyScale.bodySm.fontFamily,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

