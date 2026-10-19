import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useTranslation } from '@/shared/i18n';
import { Text } from '@/shared/ui';

import { CatalogSection } from '../catalog-section';

import {
  CountUpDemo,
  DrawDemo,
  EnterDemo,
  MotionDemo,
  PressDemo,
  ProgressDemo,
  SheenDemo,
} from './motion-demos';

/**
 * Movimiento (§4.3): M01–M05 y M08 con un botón para repetirlas. M09 (orbes) se ve en la sección de
 * vidrio y aurora. Con "Movimiento: Reducido" en la barra se ve la versión sin desplazamientos.
 */
export function MotionSection() {
  const { t } = useTranslation();
  const [replay, setReplay] = useState(0);

  return (
    <CatalogSection title={t('catalog.sections.motion')}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setReplay((count) => count + 1);
        }}
        style={styles.replay}
      >
        <Text variant="label" tone="onPrimary">
          {t('catalog.controls.replay')}
        </Text>
      </Pressable>
      <View style={styles.grid}>
        <MotionDemo title={t('catalog.motion.enter')}>
          <EnterDemo key={replay} />
        </MotionDemo>
        <MotionDemo title={t('catalog.motion.press')}>
          <PressDemo label={t('catalog.motion.press')} />
        </MotionDemo>
        <MotionDemo title={t('catalog.motion.countUp')}>
          <CountUpDemo replay={replay} />
        </MotionDemo>
        <MotionDemo title={t('catalog.motion.draw')}>
          <DrawDemo replay={replay} />
        </MotionDemo>
        <MotionDemo title={t('catalog.motion.progress')}>
          <ProgressDemo replay={replay} />
        </MotionDemo>
        <MotionDemo title={t('catalog.motion.sheen')}>
          <SheenDemo replay={replay} label={t('catalog.samples.heading')} />
        </MotionDemo>
      </View>
    </CatalogSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  replay: {
    alignSelf: 'flex-start',
    minHeight: theme.layout.minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[4],
  },
}));
