// Anillo de foco para el teclado en web (design-system.md §10): 2 px en `color.focus`, separado
// 3 px del control. Solo con `:focus-visible` (teclado), no al tocar ni al hacer clic. En nativo no
// aplica (`_web`). Lo suman a su `StyleSheet` los controles presionables y se pone en su Pressable.

export function focusRing(color: string) {
  return {
    _web: {
      '_focus-visible': {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: color,
        outlineOffset: 3,
      },
    },
  } as const;
}
