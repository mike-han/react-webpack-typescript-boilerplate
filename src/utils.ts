import { isEqual } from 'lodash-es'
import React, {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react'
import {
  DeltaValue, EdiotrValue, Editor, RichSelection, Sources, UnprivilegedEditor
} from './type'

export type RefValue<T> = React.RefObject<T> | React.MutableRefObject<T> | ((e: T) => void);

export const setRef = (ref: any, value: any) => {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

export const useRefValue = <T extends unknown>(value: T): React.MutableRefObject<T> => {
  const valuesRef = useRef(value)
  useEffect(() => {
    valuesRef.current = value
  })
  return valuesRef
}

/**
  * This will create a new function if the ref props change and are defined.
  */
export const useForkRef = <T>(refA: RefValue<T>, refB: RefValue<T>) => useMemo(() => {
  if (refA == null && refB == null) {
    return null
  }
  return (refValue: any) => {
    setRef(refA, refValue)
    setRef(refB, refValue)
  }
}, [refA, refB])

/**
 * Receives a ref, returns a ref and a callback function to assign values to both refs
 * @param ref
 */
export const useForwardRef = <T extends unknown>(ref: RefValue<T>): [React.RefObject<T>, (arg0: T) => void] => {
  const innerRef = useRef<T>(null)
  const forkedRef = useForkRef<T>(innerRef, ref)

  const handleRef = useCallback((e) => {
    setRef(forkedRef, e)
  }, [forkedRef])

  return [innerRef, handleRef]
}

/**
 * Receives a ref, return a callback function to assign val to ref and setVal
 * @param ref
 */
export const useForwardValueRef = <T>(ref: RefValue<T>): [T, (e: T) => void] => {
  const [val, setVal] = useState<T>(null as any)
  const valRef = useCallback((e: T) => {
    setVal(e)
    setRef(ref, e)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [val, valRef]
}

/**
 * Returns true if component is just mounted (on first render) and false otherwise.
 */
export const useFirstMountState = (): boolean => {
  const isFirst = useRef(true)

  if (isFirst.current) {
    isFirst.current = false

    return true
  }

  return isFirst.current
}

/**
 * React effect hook that ignores the first invocation (e.g. on mount).
 * The signature is exactly the same as the useEffect hook.
 *
 * @param effect
 * @param deps
 */
export const useUpdateEffect = (effect: () => any, deps: any) => {
  const isFirstMount = useFirstMountState()

  useEffect(() => {
    if (!isFirstMount) {
      return effect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export const setEditorReadOnly = (editor: Editor, value: boolean): void => {
  value ? editor.disable() : editor.enable()
}

// Replace the contents of the editor, but keep
// the previous selection hanging around so that
// the cursor won't move.
export const setEditorContents = (editor: Editor, value: EdiotrValue, source?: Sources): void => {
  const sel = editor.getSelection()

  if (typeof value === 'string') {
    editor.setContents(editor.clipboard.convert(value), source)
  } else {
    editor.setContents(value, source)
  }

  if (sel && editor.hasFocus()) {
    setEditorSelection(editor, sel)
  }
}

// Put the cursor at the end of the content.
export const setEditorCursorEnd = (editor: Editor, source?: Sources): void => {
  const contentLength = editor.getLength()
  const range = {
    index: contentLength - 1,
    length: 0
  }
  setEditorSelection(editor, range, source)
}

// Select all the content
export const setEditorContentSelection = (editor: Editor, source?: Sources): void => {
  const contentLength = editor.getLength()
  const range = {
    index: 0,
    length: contentLength - 1
  }
  setEditorSelection(editor, range, source)
}

export const setEditorSelection = (editor: Editor, range: RichSelection, source?: Sources): void => {
  if (range) {
    // Validate bounds before applying.
    const length = editor.getLength()
    range.index = Math.max(0, Math.min(range.index, length - 1))
    range.length = Math.max(0, Math.min(range.length, (length - 1) - range.index))
  }
  editor.setSelection(range, source)
}

export const setEditorTabIndex = (editor: Editor, tabIndex: number): void => {
  if (editor.editor && editor.editor.scroll && editor.editor.scroll.domNode) {
    editor.editor.scroll.domNode.tabIndex = tabIndex
  }
}

// Returns an weaker, unprivileged proxy object that only
// exposes read-only accessors found on the editor instance,
// without any state-modificating methods.
export const makeUnprivilegedEditor = (editor: Editor): UnprivilegedEditor => {
  if (!editor) return
  return {
    focus () { return editor.focus.apply(editor, arguments as unknown as []) },
    blur () { return editor.focus.apply(editor, arguments as unknown as []) },
    getLength () { return editor.getLength.apply(editor, arguments as unknown as []) },
    getText () { return editor.getText.apply(editor, arguments as unknown as []) },
    getHTML () { return editor.root.innerHTML },
    getContents () { return editor.getContents.apply(editor, arguments as unknown as []) },
    getSelection () { return editor.getSelection.apply(editor, arguments as unknown as []) },
    getBounds () { return editor.getBounds.apply(editor, arguments as any) },
    getFormat () { return editor.getFormat.apply(editor, arguments as unknown as []) },
    getIndex () { return editor.getIndex.apply(editor, arguments as any) },
    getLeaf () { return editor.getLeaf.apply(editor, arguments as any) }
  }
}

// True if the value is a Delta instance or a Delta look-alike.
export const isDelta = (value: any): boolean => !!(value && value.ops)

export const isDeltaEqual = (prve: DeltaValue, next: DeltaValue) => {
  if (isDelta(prve) && isDelta(next)) {
    return isEqual(prve.ops, next.ops)
  }
}

export const isEditorValueEqual = (prve: EdiotrValue, next: EdiotrValue) => {
  let equal = false
  if (isDelta(prve) && isDelta(next)) {
    equal = isDeltaEqual(prve as DeltaValue, next as DeltaValue)
  } else {
    equal = prve === next
  }
  return equal
}
