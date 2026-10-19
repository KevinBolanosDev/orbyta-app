import Flame from 'lucide-react-native/icons/flame';
import Landmark from 'lucide-react-native/icons/landmark';
import PiggyBank from 'lucide-react-native/icons/piggy-bank';
import Receipt from 'lucide-react-native/icons/receipt';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useNumberLocale, useTranslation } from '@/shared/i18n';
import {
  AchievementBadge,
  AmountText,
  Button,
  formatCount,
  formatDay,
  HoloCard,
  holoGradient,
  LevelBadge,
  levelFromXp,
  ProgressBar,
  StreakCounter,
  Text,
  toIsoDay,
  totalXpForLevel,
  useToast,
  XPBar,
  XPFloat,
  type AchievementState,
  type XPFloatHandle,
} from '@/shared/ui';

import { CatalogSection, CatalogSubheading } from '../catalog-section';

/** Arranca en el ejemplo del design system: nivel 12 con 2.450 / 3.600 XP. */
const START_XP = totalXpForLevel(12) + 2450;
/** XP de la tabla §5.1 que usa la demo. */
const XP = { expense: 5, goal: 500, streak: 50 } as const;
const GOAL = { saved: 6_400_000, target: 10_000_000 };

/** Gamificación de F1.8 (§5 y §7.3): nivel, XP, racha, logros, carta holo y "+XP". */
export function GameSection() {
  const { t } = useTranslation();
  const locale = useNumberLocale();
  const toast = useToast();
  const [xp, setXp] = useState(START_XP);
  const [streak, setStreak] = useState<AchievementState>('progress');
  const [today] = useState(() => toIsoDay(new Date()));
  const expenseFloatRef = useRef<XPFloatHandle>(null);
  const goalFloatRef = useRef<XPFloatHandle>(null);
  const progress = levelFromXp(xp);
  const tier = t(`catalog.game.tiers.${progress.tier}`);
  const gain = (amount: number) => t('catalog.game.xpGain', { xp: formatCount(amount, locale) });

  const earn = (amount: number, float: XPFloatHandle | null) => {
    float?.show(gain(amount));
    const next = levelFromXp(xp + amount);
    if (next.level > progress.level) {
      toast.show({ message: t('catalog.game.levelUp', { level: next.level }), tone: 'success' });
    }
    setXp(xp + amount);
  };

  const unlockStreak = () => {
    setStreak('unlocked');
    toast.show({
      message: t('catalog.game.items.streak.title'),
      achievement: { overline: t('catalog.game.unlocked'), xp: gain(XP.streak), icon: Flame },
    });
    setXp(xp + XP.streak);
  };

  const date = formatDay(today, locale);
  const badgeLabel = (title: string, state: AchievementState, detail: string) =>
    t('catalog.game.badgeLabel', { title, state: t(`catalog.game.states.${state}`, { detail }) });
  const percent = Math.round((GOAL.saved / GOAL.target) * 100);

  return (
    <CatalogSection title={t('catalog.sections.game')}>
      <CatalogSubheading>{t('catalog.game.level')}</CatalogSubheading>
      <View style={styles.row}>
        {(['s', 'm', 'l'] as const).map((size) => (
          <LevelBadge
            key={size}
            level={progress.level}
            size={size}
            accessibilityLabel={t('catalog.game.levelLabel', { level: progress.level, tier })}
          />
        ))}
        <Text variant="titleS">{tier}</Text>
      </View>

      <CatalogSubheading>{t('catalog.game.xp')}</CatalogSubheading>
      <XPBar
        current={progress.current}
        goal={progress.goal}
        level={progress.level}
        locale={locale}
        label={t('catalog.game.levelTitle', { level: progress.level, tier })}
        accessibilityLabel={t('catalog.game.xpLabel', { level: progress.level })}
      />
      <View style={styles.row}>
        <View>
          <Button
            label={`${t('catalog.game.logExpense')} · ${gain(XP.expense)}`}
            variant="secondary"
            size="s"
            onPress={() => {
              earn(XP.expense, expenseFloatRef.current);
            }}
          />
          <XPFloat ref={expenseFloatRef} />
        </View>
        <View>
          <Button
            label={`${t('catalog.game.goalDone')} · ${gain(XP.goal)}`}
            variant="secondary"
            size="s"
            onPress={() => {
              earn(XP.goal, goalFloatRef.current);
            }}
          />
          <XPFloat ref={goalFloatRef} />
        </View>
      </View>

      <CatalogSubheading>{t('catalog.game.streak')}</CatalogSubheading>
      <View style={styles.row}>
        <StreakCounter
          days={12}
          unit={t('catalog.game.days')}
          locale={locale}
          accessibilityLabel={t('catalog.game.streakLabel', { days: 12 })}
        />
        <StreakCounter
          days={5}
          unit={t('catalog.game.days')}
          atRisk
          riskLabel={t('catalog.game.streakRisk')}
          locale={locale}
          accessibilityLabel={t('catalog.game.streakRiskLabel', { days: 5 })}
        />
      </View>

      <CatalogSubheading>{t('catalog.game.achievements')}</CatalogSubheading>
      <View style={styles.badges}>
        <AchievementBadge
          title={t('catalog.game.items.budget.title')}
          icon={PiggyBank}
          family="control"
          state="unlocked"
          detail={date}
          accessibilityLabel={badgeLabel(t('catalog.game.items.budget.title'), 'unlocked', date)}
        />
        <AchievementBadge
          title={t('catalog.game.items.receipts.title')}
          icon={Receipt}
          family="control"
          state="progress"
          progress={0.34}
          detail="34 / 100"
          accessibilityLabel={badgeLabel(
            t('catalog.game.items.receipts.title'),
            'progress',
            '34 / 100',
          )}
        />
        <AchievementBadge
          title={t('catalog.game.items.cdt.title')}
          icon={Landmark}
          family="builder"
          state="locked"
          detail={t('catalog.game.items.cdt.hint')}
          accessibilityLabel={badgeLabel(
            t('catalog.game.items.cdt.title'),
            'locked',
            t('catalog.game.items.cdt.hint'),
          )}
        />
        <AchievementBadge
          title={t('catalog.game.items.streak.title')}
          icon={Flame}
          family="discipline"
          state={streak}
          progress={6 / 7}
          detail={streak === 'unlocked' ? date : '6 / 7'}
          accessibilityLabel={badgeLabel(
            t('catalog.game.items.streak.title'),
            streak,
            streak === 'unlocked' ? date : '6 / 7',
          )}
        />
      </View>
      <View style={styles.row}>
        {streak === 'unlocked' ? (
          <Button
            label={t('catalog.game.reset')}
            variant="ghost"
            size="s"
            onPress={() => {
              setStreak('progress');
            }}
          />
        ) : (
          <Button label={t('catalog.game.unlock')} size="s" onPress={unlockStreak} />
        )}
      </View>

      <CatalogSubheading>{t('catalog.game.holo')}</CatalogSubheading>
      <Text tone="muted">{t('catalog.game.holoHint')}</Text>
      <HoloCard style={styles.card}>
        <Text variant="overline" tone="onHolo">
          {t('catalog.game.goalKind')}
        </Text>
        <Text variant="titleM" tone="onHolo">
          {t('catalog.game.goal')}
        </Text>
        <AmountText
          value={GOAL.saved.toString()}
          currency="COP"
          locale={locale}
          variant="numL"
          tone="onHolo"
        />
        <ProgressBar
          value={GOAL.saved / GOAL.target}
          color={holoGradient.ink}
          accessibilityLabel={t('catalog.game.goalLabel', { percent })}
        />
        <Text variant="caption" tone="onHolo">
          {t('catalog.game.goalOf', { percent })}
        </Text>
      </HoloCard>
    </CatalogSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.space[4],
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[4],
  },
  card: {
    maxWidth: 360,
  },
}));
