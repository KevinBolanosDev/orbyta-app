import { ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch/600SemiBold';
import { ChakraPetch_700Bold } from '@expo-google-fonts/chakra-petch/700Bold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Exo2_200ExtraLight } from '@expo-google-fonts/exo-2/200ExtraLight';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { Michroma_400Regular } from '@expo-google-fonts/michroma/400Regular';

import { fontFamily, type FontFamilyToken } from '../tokens';

// Archivos de fuente por nombre de familia (design-system.md §2.3). Se importa cada peso por su
// subruta para que el bundle solo lleve los 11 archivos usados. La app los carga con expo-font
// (`useFonts(fontAssets)`) antes de ocultar la splash.

const assets: Record<FontFamilyToken, number> = {
  display600: ChakraPetch_600SemiBold,
  display700: ChakraPetch_700Bold,
  body400: DMSans_400Regular,
  body500: DMSans_500Medium,
  body600: DMSans_600SemiBold,
  body700: DMSans_700Bold,
  mono400: JetBrainsMono_400Regular,
  mono500: JetBrainsMono_500Medium,
  mono700: JetBrainsMono_700Bold,
  brand: Michroma_400Regular,
  brandThin: Exo2_200ExtraLight,
};

/** `{ 'DMSans_400Regular': <asset>, … }`, listo para `useFonts`. */
export const fontAssets: Readonly<Record<string, number>> = Object.fromEntries(
  (Object.keys(assets) as FontFamilyToken[]).map((token) => [fontFamily[token], assets[token]]),
);
