import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import Inbox from 'lucide-react-native/icons/inbox';
import Plus from 'lucide-react-native/icons/plus';
import Trash from 'lucide-react-native/icons/trash';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useLanguage, useTranslation } from '@/shared/i18n';
import {
  AmountPrivacyProvider,
  AmountText,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  DeltaText,
  EmptyState,
  ErrorState,
  IconButton,
  SectionHeader,
  Skeleton,
  Text,
} from '@/shared/ui';

import { CatalogSection, CatalogSubheading } from '../catalog-section';

// Nombres de ejemplo (personas, comercios y brokers): son datos, no textos de la interfaz.
const AVATARS = ['Ana Gómez', 'Bancolombia', 'Interactive Brokers', 'Rappi'];

/** Primitivas de contenido y acción de F1.4 (§7.1), con modo privado para los montos. */
export function ComponentsSection() {
  const { t } = useTranslation();
  const [language] = useLanguage();
  const { theme } = useUnistyles();
  const locale = language === 'es' ? 'es-CO' : 'en-US';
  const [hidden, setHidden] = useState(false);
  const [presses, setPresses] = useState(0);
  const [replay, setReplay] = useState(0);
  const [filter, setFilter] = useState<'thisMonth' | 'income'>('thisMonth');
  const [tagList, setTagList] = useState<readonly ('food' | 'transport')[]>(['food', 'transport']);

  return (
    <CatalogSection title={t('catalog.sections.components')}>
      <CatalogSubheading>{t('catalog.components.buttons')}</CatalogSubheading>
      <View style={styles.row}>
        <Button label={t('catalog.components.save')} />
        <Button label={t('catalog.components.cancel')} variant="secondary" />
        <Button label={t('catalog.components.details')} variant="ghost" />
        <Button label={t('catalog.components.delete')} variant="danger" icon={Trash} />
      </View>
      <View style={styles.row}>
        <Button label={t('catalog.components.saving')} loading />
        <Button label={t('catalog.components.unavailable')} disabled />
        <Button label={t('catalog.components.small')} size="s" variant="secondary" icon={Plus} />
        <IconButton icon={Plus} accessibilityLabel={t('catalog.components.add')} />
        <IconButton
          icon={Plus}
          variant="plain"
          tone="primary"
          accessibilityLabel={t('catalog.components.add')}
        />
      </View>

      <CatalogSubheading>{t('catalog.components.cards')}</CatalogSubheading>
      <View style={styles.row}>
        <Card
          hero
          style={styles.card}
          header={
            <SectionHeader
              title={t('catalog.components.sectionTitle')}
              actionLabel={t('catalog.components.seeAll')}
              onAction={() => undefined}
            />
          }
        >
          <Text variant="titleM">{t('catalog.components.heroTitle')}</Text>
          <Text tone="muted">{t('catalog.components.heroBody')}</Text>
        </Card>
        <Card
          style={styles.card}
          onPress={() => {
            setPresses((count) => count + 1);
          }}
          accessibilityLabel={t('catalog.components.pressableTitle')}
        >
          <Text variant="titleS">{t('catalog.components.pressableTitle')}</Text>
          <Text tone="muted">{t('catalog.components.pressableBody', { count: presses })}</Text>
        </Card>
      </View>

      <CatalogSubheading>{t('catalog.components.chips')}</CatalogSubheading>
      <View style={styles.row}>
        {(['thisMonth', 'income'] as const).map((key) => (
          <Chip
            key={key}
            label={t(`catalog.components.${key}`)}
            selected={filter === key}
            onPress={() => {
              setFilter(key);
            }}
          />
        ))}
        {tagList.map((key) => (
          <Chip
            key={key}
            variant="input"
            label={t(`catalog.components.${key}`)}
            removeLabel={t('catalog.components.remove', { label: t(`catalog.components.${key}`) })}
            onRemove={() => {
              setTagList((current) => current.filter((tag) => tag !== key));
            }}
          />
        ))}
        <Chip variant="category" label={t('catalog.components.food')} color={theme.categories[4]} />
        <Chip
          variant="category"
          label={t('catalog.components.transport')}
          color={theme.categories[1]}
        />
      </View>

      <CatalogSubheading>{t('catalog.components.badges')}</CatalogSubheading>
      <View style={styles.row}>
        <Badge label={t('catalog.components.newBadge')} tone="primary" />
        <Badge label={t('catalog.components.healthy')} tone="gain" />
        <Badge label={t('catalog.components.atLimit')} tone="warning" />
        <Badge label={t('catalog.components.overdue')} tone="loss" />
        <Badge
          label={128}
          max={99}
          tone="primary"
          accessibilityLabel={t('catalog.components.unread')}
        />
        <Badge tone="loss" accessibilityLabel={t('catalog.components.unread')} />
        {AVATARS.map((name) => (
          <Avatar key={name} name={name} size={36} />
        ))}
      </View>

      <CatalogSubheading>{t('catalog.components.amounts')}</CatalogSubheading>
      <Text variant="caption" tone="muted">
        {t('catalog.components.amountsHint')}
      </Text>
      <AmountPrivacyProvider hidden={hidden} hiddenLabel={t('amount.hidden')}>
        <View style={styles.row}>
          <IconButton
            icon={hidden ? EyeOff : Eye}
            selected={hidden}
            accessibilityLabel={hidden ? t('amount.show') : t('amount.hide')}
            onPress={() => {
              setHidden((value) => !value);
            }}
          />
          <Button
            label={t('catalog.components.replay')}
            variant="ghost"
            size="s"
            onPress={() => {
              setReplay((count) => count + 1);
            }}
          />
        </View>
        <AmountText
          key={replay}
          value="48250000"
          currency="COP"
          locale={locale}
          variant="displayL"
          animate
        />
        <View style={styles.row}>
          <AmountText value="1234.56" currency="USD" locale={locale} />
          <AmountText value="-85400" currency="COP" locale={locale} colorBySign />
          <AmountText
            value="2300000"
            currency="COP"
            locale={locale}
            colorBySign
            signDisplay="always"
          />
          <DeltaText value="2.4" locale={locale} />
          <DeltaText value="-1" locale={locale} />
          <DeltaText value="0" locale={locale} />
        </View>
      </AmountPrivacyProvider>

      <CatalogSubheading>{t('catalog.components.skeletons')}</CatalogSubheading>
      <View style={styles.skeletonRow}>
        <Skeleton shape="circle" />
        <View style={styles.skeletonLines}>
          <Skeleton width="70%" />
          <Skeleton width="40%" />
        </View>
      </View>
      <Skeleton shape="block" />

      <CatalogSubheading>{t('catalog.components.states')}</CatalogSubheading>
      <View style={styles.row}>
        <Card style={styles.card}>
          <EmptyState
            icon={Inbox}
            title={t('catalog.components.emptyTitle')}
            message={t('catalog.components.emptyMessage')}
            actionLabel={t('catalog.components.emptyAction')}
            onAction={() => undefined}
          />
        </Card>
        <Card style={styles.card}>
          <ErrorState
            title={t('catalog.components.errorTitle')}
            message={t('catalog.components.errorMessage')}
            retryLabel={t('catalog.components.retry')}
            onRetry={() => undefined}
          />
          <ErrorState
            inline
            title={t('catalog.components.errorTitle')}
            retryLabel={t('catalog.components.retry')}
            onRetry={() => undefined}
          />
        </Card>
      </View>
    </CatalogSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.space[3],
  },
  card: {
    flexGrow: 1,
    flexBasis: 280,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
  },
  skeletonLines: {
    flex: 1,
    gap: theme.space[2],
  },
}));
