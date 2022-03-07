import React from 'react';
import { isEqual } from 'lodash-es';
import Quill, { Sources } from 'quill';
import { DeltaStatic, Range, UnprivilegedEditor, Value } from '../types';

/**
 * This function is used to set the value to a ref.
 * @param ref {any}
 * @param value {any}
 */
export const setRef = (ref: any, value: any) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
};

/**
  * This will create a new function if the ref props change and are defined.
  */
export const useForkRef = <T>(refA: React.Ref<T>, refB: React.Ref<T>) => React.useMemo(() => {
  if (refA == null && refB == null) {
    return null;
  }
  return (refValue: any) => {
    setRef(refA, refValue);
    setRef(refB, refValue);
  };
}, [refA, refB]);

/**
 * Receives a ref, returns a ref and a callback function to assign values to both refs
 * @param ref
 */
export const useForwardRef = <T extends unknown>(ref: React.Ref<T>): [React.RefObject<T>, (arg0: T) => void] => {
  const innerRef = React.useRef<T>(null);
  const forkedRef = useForkRef<T>(innerRef, ref);

  const handleRef = React.useCallback((e) => {
    setRef(forkedRef, e);
  }, [forkedRef]);

  return [innerRef, handleRef];
};

/**
 * Receives a ref, return a callback function to assign val to ref and setVal
 * @param ref
 */
export const useForwardValueRef = <T>(ref: React.Ref<T>): [T, (e: T) => void] => {
  const [val, setVal] = React.useState<T>(null as any);
  const valRef = React.useCallback((e: T) => {
    setVal(e);
    setRef(ref, e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [val, valRef];
};

/**
 * Returns true if component is just mounted (on first render) and false otherwise.
 */
export const useFirstMountState = (): boolean => {
  const isFirst = React.useRef(true);

  if (isFirst.current) {
    isFirst.current = false;

    return true;
  }

  return isFirst.current;
};

/**
 * React effect hook that ignores the first invocation (e.g. on mount).
 * The signature is exactly the same as the React.useEffect hook.
 *
 * @param effect
 * @param deps
 */
export const useUpdateEffect = (effect: () => any, deps: any) => {
  const isFirstMount = useFirstMountState();

  React.useEffect(() => {
    if (!isFirstMount) {
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

// Replace the contents of the editor, but keep the previous selection
// hanging around so that the cursor won't move.
export const setEditorContents = (editor: Quill, value: Value, source?: Sources): void => {
  const sel = editor.getSelection();

  if (typeof value === 'string') {
    editor.setContents(editor.clipboard.convert(value as any), source);
  } else {
    editor.setContents(value, source);
  }

  if (sel && editor.hasFocus()) {
    setEditorSelection(editor, sel);
  }
};

// Put the cursor at the end of the content.
export const setEditorCursorEnd = (editor: Quill, source?: Sources): void => {
  const contentLength = editor.getLength();
  const range = {
    index: contentLength - 1,
    length: 0
  };
  setEditorSelection(editor, range, source);
};

export const setEditorSelection = (editor: Quill, range: Range, source?: Sources): void => {
  if (range) {
    // Validate bounds before applying.
    const length = editor.getLength();
    range.index = Math.max(0, Math.min(range.index, length - 1));
    range.length = Math.max(0, Math.min(range.length, (length - 1) - range.index));
  }
  editor.setSelection(range, source);
};

/**
 * Returns an weaker, unprivileged proxy object that only exposes read-only accessors found on the editor instance, without any state-modificating methods.
 * @param editor {Quill}
 * @returns {UnprivilegedEditor}
 */
export const makeUnprivilegedEditor = (editor: Quill): UnprivilegedEditor => {
  if (!editor) return;
  return {
    getLength: function () { return editor.getLength.apply(editor, arguments as unknown as []); },
    getText: function () { return editor.getText.apply(editor, arguments as unknown as []); },
    getHTML: function () { return editor.root.innerHTML; },
    getContents: function () { return editor.getContents.apply(editor, arguments as unknown as []); },
    getSelection: function () { return editor.getSelection.apply(editor, arguments as unknown as []); },
    getBounds: function () { return editor.getBounds.apply(editor, arguments as any); }
  };
};

/**
 * True if the value is a Delta instance or a Delta look-alike.
 * @param value {any}
 * @returns {boolean}
 */
export const isDelta = (value: any): boolean => !!(value && value.ops);

/**
 * Checks if the two deltas are the same.
 * @param prve {DeltaStatic}
 * @param next {DeltaStatic}
 * @returns {boolean}
 */
export const isDeltaEqual = (prve: DeltaStatic, next: DeltaStatic) => {
  if (isDelta(prve) && isDelta(next)) {
    return isEqual(prve.ops, next.ops);
  }
};

/**
 * Checks if the two values are the same.
 * @param prve {Value}
 * @param next {Value}
 * @returns {boolean}
 */
export const isEditorValueEqual = (prve: Value, next: Value) => {
  let equal = false;
  if (isDelta(prve) && isDelta(next)) {
    equal = isDeltaEqual(prve as DeltaStatic, next as DeltaStatic);
  } else {
    equal = prve === next;
  }
  return equal;
};
